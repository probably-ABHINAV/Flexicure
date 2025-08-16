import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { testId, variant, event, properties, userId, sessionId, timestamp, url, userAgent } = body

    if (!testId || !variant || !event || !userId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { error } = await supabase.from("ab_test_events").insert({
      test_id: testId,
      variant,
      event,
      properties: properties || {},
      user_id: userId,
      session_id: sessionId,
      timestamp: timestamp || new Date().toISOString(),
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Failed to track AB test event:", error)
      return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("AB testing API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const testId = searchParams.get("testId")

    if (!testId) {
      return NextResponse.json({ error: "testId parameter is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Get analytics for the test
    const { data: events, error } = await supabase
      .from("ab_test_events")
      .select("*")
      .eq("test_id", testId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch AB test analytics:", error)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Calculate analytics
    const analytics = calculateAnalytics(events || [])

    return NextResponse.json({
      testId,
      analytics,
      totalEvents: events?.length || 0,
    })
  } catch (error) {
    console.error("AB testing analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateAnalytics(events: any[]) {
  const variants: Record<string, any> = {}

  events.forEach((event) => {
    if (!variants[event.variant]) {
      variants[event.variant] = {
        variant: event.variant,
        impressions: 0,
        conversions: 0,
        clicks: 0,
        uniqueUsers: new Set(),
      }
    }

    const variantData = variants[event.variant]
    variantData.uniqueUsers.add(event.user_id)

    switch (event.event) {
      case "impression":
        variantData.impressions++
        break
      case "conversion":
        variantData.conversions++
        break
      case "click":
        variantData.clicks++
        break
    }
  })

  // Convert to final format
  const result = Object.values(variants).map((variant: any) => ({
    variant: variant.variant,
    impressions: variant.impressions,
    conversions: variant.conversions,
    clicks: variant.clicks,
    uniqueUsers: variant.uniqueUsers.size,
    conversionRate: variant.impressions > 0 ? ((variant.conversions / variant.impressions) * 100).toFixed(2) : "0.00",
    clickThroughRate: variant.impressions > 0 ? ((variant.clicks / variant.impressions) * 100).toFixed(2) : "0.00",
  }))

  return result
}
