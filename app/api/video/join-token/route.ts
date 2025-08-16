import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/ssr"

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

    // Verify user access to booking
    const { data: booking } = await supabase
      .from("bookings_view")
      .select("id, patient_id, therapist_id, patient_name, therapist_name, daily_room_url")
      .eq("id", bookingId)
      .single()

    if (!booking || (booking.patient_id !== user.id && booking.therapist_id !== user.id)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    if (!booking.daily_room_url) {
      return NextResponse.json({ error: "No room created for this booking" }, { status: 404 })
    }

    const apiKey = process.env.DAILY_API_KEY
    if (!apiKey) return NextResponse.json({ error: "DAILY_API_KEY not configured" }, { status: 500 })

    const roomName = extractRoomName(booking.daily_room_url)
    const isPatient = booking.patient_id === user.id
    const userName = isPatient ? booking.patient_name : booking.therapist_name

    // Create meeting token for this user
    const resp = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName || (isPatient ? "Patient" : "Therapist"),
          is_owner: !isPatient, // therapist is owner
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4, // 4 hours
        },
      }),
    })

    const json = await resp.json()
    if (!resp.ok) {
      return NextResponse.json({ error: json?.info || "Failed to create token" }, { status: 500 })
    }

    return NextResponse.json({ token: json.token, roomUrl: booking.daily_room_url })
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
