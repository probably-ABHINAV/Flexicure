/**
 * Enhanced security middleware with rate limiting, security headers, and monitoring.
 */
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Rate limiting store (in production, use Redis or external service)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security headers configuration
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-XSS-Protection": "1; mode=block",
}

// Content Security Policy
const csp = `
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://unpkg.com https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob:;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://*.supabase.co https://api.daily.co https://api.resend.com https://api.twilio.com https://checkout.razorpay.com https://api.razorpay.com wss://*.daily.co;
frame-src https://checkout.razorpay.com https://*.daily.co;
media-src 'self' https://*.daily.co blob:;
worker-src 'self' blob:;
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
`
  .replace(/\n/g, " ")
  .replace(/\s+/g, " ")
  .trim()

// Rate limiting configuration
const RATE_LIMITS = {
  "/api/auth": { requests: 5, window: 60000 }, // 5 requests per minute
  "/api/payments": { requests: 10, window: 60000 }, // 10 requests per minute
  "/api/bookings": { requests: 20, window: 60000 }, // 20 requests per minute
  "/api/newsletter": { requests: 3, window: 300000 }, // 3 requests per 5 minutes
  default: { requests: 100, window: 60000 }, // 100 requests per minute
}

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown"
  return `${ip}:${req.nextUrl.pathname}`
}

function checkRateLimit(req: NextRequest): boolean {
  const key = getRateLimitKey(req)
  const pathname = req.nextUrl.pathname

  // Find matching rate limit rule
  let rateLimit = RATE_LIMITS.default
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (path !== "default" && pathname.startsWith(path)) {
      rateLimit = limit
      break
    }
  }

  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, { count: 1, resetTime: now + rateLimit.window })
    return true
  }

  if (record.count >= rateLimit.requests) {
    return false
  }

  record.count++
  return true
}

function logSecurityEvent(req: NextRequest, event: string, details?: any) {
  const timestamp = new Date().toISOString()
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  console.log(
    JSON.stringify({
      timestamp,
      event,
      ip,
      userAgent,
      path: req.nextUrl.pathname,
      method: req.method,
      ...details,
    }),
  )
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/_") ||
    (pathname.includes(".") && !pathname.startsWith("/api/"))
  ) {
    return res
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(req)) {
      logSecurityEvent(req, "RATE_LIMIT_EXCEEDED")
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + 60),
        },
      })
    }
  }

  // Security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value)
  })

  // Content Security Policy
  res.headers.set("Content-Security-Policy", csp)

  // Additional security for sensitive routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    res.headers.set("Pragma", "no-cache")
    res.headers.set("Expires", "0")
  }

  // Log suspicious activity
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript protocol
  ]

  const queryString = req.nextUrl.search
  const fullPath = pathname + queryString

  if (suspiciousPatterns.some((pattern) => pattern.test(fullPath))) {
    logSecurityEvent(req, "SUSPICIOUS_REQUEST", { path: fullPath })
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
