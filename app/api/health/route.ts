import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: "ok" | "error"; latency?: number; error?: string }> = {}

  // Database health check
  try {
    const dbStart = Date.now()
    const supabase = getSupabaseAdminClient()
    await supabase.from("profiles").select("count").limit(1).single()
    checks.database = {
      status: "ok",
      latency: Date.now() - dbStart,
    }
  } catch (error: any) {
    checks.database = {
      status: "error",
      error: error.message,
    }
  }

  // External services health check
  const services = [
    { name: "resend", url: "https://api.resend.com/emails", key: process.env.RESEND_API_KEY },
    { name: "daily", url: "https://api.daily.co/v1/rooms", key: process.env.DAILY_API_KEY },
  ]

  for (const service of services) {
    if (!service.key) {
      checks[service.name] = { status: "error", error: "API key not configured" }
      continue
    }

    try {
      const serviceStart = Date.now()
      const response = await fetch(service.url, {
        method: "GET",
        headers: { Authorization: `Bearer ${service.key}` },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      checks[service.name] = {
        status: response.ok ? "ok" : "error",
        latency: Date.now() - serviceStart,
        ...(response.ok ? {} : { error: `HTTP ${response.status}` }),
      }
    } catch (error: any) {
      checks[service.name] = {
        status: "error",
        error: error.message,
      }
    }
  }

  const overallStatus = Object.values(checks).every((check) => check.status === "ok") ? "healthy" : "degraded"
  const totalLatency = Date.now() - startTime

  const healthData = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    latency: totalLatency,
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    checks,
  }

  return NextResponse.json(healthData, {
    status: overallStatus === "healthy" ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
