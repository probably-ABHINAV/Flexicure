import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/ssr"
import { getUtcRangeForLocalDate, getLocalDayOfWeek } from "@/lib/time"

// GET /api/bookings/slots?therapistId=...&date=YYYY-MM-DD&timezone=Area/City
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const therapistId = searchParams.get("therapistId")
    const date = searchParams.get("date")
    const timezone = searchParams.get("timezone") || "UTC"
    const slotMinutes = Number(searchParams.get("slotMinutes") || "30")
    const durationMinutes = Number(searchParams.get("durationMinutes") || "45")

    if (!therapistId || !date) {
      return NextResponse.json({ error: "Missing therapistId or date" }, { status: 400 })
    }

    // Get availability for that day-of-week
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)

    const dow = getLocalDayOfWeek(date, timezone)
    const { data: avail } = await supabase
      .from("availability")
      .select("start_time, end_time")
      .eq("therapist_id", therapistId)
      .eq("day_of_week", dow)

    // If no availability that day, return empty
    if (!avail || avail.length === 0) {
      return NextResponse.json({ slots: [] })
    }

    // Compute UTC range for that local date to get existing bookings
    const { startUtc, endUtc } = getUtcRangeForLocalDate(date, timezone)
    const { data: bookings } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("therapist_id", therapistId)
      .gte("start_time", startUtc.toISOString())
      .lte("start_time", endUtc.toISOString())

    // Helper to check overlap
    const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => aStart < bEnd && bStart < aEnd

    // Build candidate slots from availability windows (in local time), then filter by conflicts.
    const slots: string[] = []
    for (const a of avail) {
      // a.start_time and a.end_time are "HH:MM:SS" in DB (time)
      const startHHmm = (a.start_time as string).slice(0, 5)
      const endHHmm = (a.end_time as string).slice(0, 5)

      // Build all slot starts from startHHmm to endHHmm - durationMinutes
      const startLocal = new Date(`${date}T${startHHmm}:00`)
      const endLocal = new Date(`${date}T${endHHmm}:00`)
      for (
        let t = startLocal.getTime();
        t + durationMinutes * 60_000 <= endLocal.getTime();
        t += slotMinutes * 60_000
      ) {
        const slotStartLocal = new Date(t)
        const slotEndLocal = new Date(t + durationMinutes * 60_000)

        // Convert to UTC for conflict checking
        const slotStartUtc = new Date(slotStartLocal.toLocaleString("en-US", { timeZone: timezone }))
        const slotEndUtc = new Date(slotEndLocal.toLocaleString("en-US", { timeZone: timezone }))

        // If any booking overlaps, skip
        const conflict = (bookings || []).some((b) => {
          const bStart = new Date(b.start_time as string)
          const bEnd = new Date(b.end_time as string)
          return overlaps(slotStartUtc, slotEndUtc, bStart, bEnd)
        })
        if (!conflict) {
          // Present in HH:mm for UI
          slots.push(
            slotStartLocal
              .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" })
              .slice(0, 5),
          )
        }
      }
    }

    // Return unique, sorted times in local HH:mm format relative to selected date
    const unique = Array.from(new Set(slots)).sort((a, b) => (a < b ? -1 : 1))
    return NextResponse.json({ slots: unique, slotMinutes, durationMinutes })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
