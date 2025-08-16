import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const headersList = await headers()

    const errorData = {
      timestamp: new Date().toISOString(),
      userAgent: headersList.get("user-agent"),
      referer: headersList.get("referer"),
      ip: headersList.get("x-forwarded-for")?.split(",")[0] || "unknown",
      ...body,
    }

    // Log error (in production, send to monitoring service)
    console.error("CLIENT_ERROR:", JSON.stringify(errorData, null, 2))

    // In production, you might want to:
    // - Send to Sentry, LogRocket, or similar service
    // - Store in database for analysis
    // - Send alerts for critical errors

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error logging client error:", error)
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 })
  }
}
