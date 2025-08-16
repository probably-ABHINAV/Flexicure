import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"

// Common validation schemas
export const emailSchema = z.string().email().max(254)
export const passwordSchema = z.string().min(8).max(128)
export const nameSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z\s'-]+$/)
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-$$$$]+$/)
  .min(10)
  .max(20)
export const uuidSchema = z.string().uuid()

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li"],
    ALLOWED_ATTR: [],
  })
}

export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

export function validateAndSanitizeInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
  sanitize = true,
): { success: true; data: T } | { success: false; error: string } {
  try {
    let processedInput = input

    // Apply sanitization for string inputs
    if (sanitize && typeof input === "string") {
      processedInput = sanitizeText(input)
    } else if (sanitize && typeof input === "object" && input !== null) {
      processedInput = sanitizeObject(input as Record<string, any>)
    }

    const result = schema.parse(processedInput)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" }
    }
    return { success: false, error: "Invalid input" }
  }
}

function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => (typeof item === "string" ? sanitizeText(item) : item))
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Rate limiting helpers
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return function checkLimit(identifier: string): boolean {
    const now = Date.now()
    const record = requests.get(identifier)

    if (!record || now > record.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= maxRequests) {
      return false
    }

    record.count++
    return true
  }
}

// SQL injection prevention
export function escapeSqlIdentifier(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9_]/g, "")
}

// XSS prevention for dynamic content
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }

  return text.replace(/[&<>"']/g, (m) => map[m])
}
