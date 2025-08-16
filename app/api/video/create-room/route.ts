import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/ssr"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    if (!bookingId) return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })

    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Check if user is authorized for this booking (patient or therapist)
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, patient_id, therapist_id, daily_room_url, start_time, end_time, status")
      .eq("id", bookingId)
      .single()

    if (error || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    if (booking.patient_id !== user.id && booking.therapist_id !== user.id) {
      return NextResponse.json({ error: "Not authorized for this booking" }, { status: 403 })
    }

    // If room already exists, return it
    if (booking.daily_room_url) {
      return NextResponse.json({ url: booking.daily_room_url, roomName: extractRoomName(booking.daily_room_url) })
    }

    const apiKey = process.env.DAILY_API_KEY
    if (!apiKey) return NextResponse.json({ error: "DAILY_API_KEY not configured" }, { status: 500 })

    // Calculate room expiration (session end + 1 hour buffer)
    const sessionEnd = new Date(booking.end_time)
    const expiration = Math.floor((sessionEnd.getTime() + 60 * 60 * 1000) / 1000) // +1 hour in seconds

    const roomName = `flexicure-${bookingId.slice(0, 8)}-${Date.now()}`

    const resp = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: true,
          enable_prejoin_ui: true,
          max_participants: 2, // patient + therapist
          exp: expiration,
        },
      }),
    })

    const json = await resp.json()
    if (!resp.ok) {
      return NextResponse.json({ error: json?.info || "Failed to create room" }, { status: 500 })
    }

    const roomUrl = json.url as string

    // Update booking with room URL using admin client to bypass RLS
    const adminSupabase = getSupabaseAdminClient()
    await adminSupabase.from("bookings").update({ daily_room_url: roomUrl }).eq("id", bookingId)

    return NextResponse.json({ url: roomUrl, roomName })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}

function extractRoomName(url: string): string {
  try {
    return new URL(url).pathname.split("/").pop() || "room"
  } catch {
    return "room"
  }
}
