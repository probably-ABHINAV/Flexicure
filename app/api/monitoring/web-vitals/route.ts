import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, value, rating, sessionId, url, userAgent, connectionType, deviceType, timestamp } = body

    if (!name || value === undefined || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Store performance metric
    const { error } = await supabase.from("performance_metrics").insert({
      session_id: sessionId,
      page_url: url,
      [name.toLowerCase()]: value,
      user_agent: userAgent,
      connection_type: connectionType,
      device_type: deviceType,
      created_at: timestamp,
    })

    if (error) {
      console.error("Failed to store performance metric:", error)
      return NextResponse.json({ error: "Failed to store metric" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Web vitals API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
