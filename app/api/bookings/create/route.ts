import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { createServerClient } from "@/lib/supabase/ssr"
import { toUtcStartEndISO, getLocalDayOfWeek } from "@/lib/time"
import { Resend } from "resend"

function emailTemplate({
  patientName,
  therapistName,
  date,
  time,
  timezone,
}: {
  patientName: string
  therapistName: string
  date: string
  time: string
  timezone: string
}) {
  return `
  <div style="font-family: Arial, sans-serif; color: #111">
    <h2>Booking confirmed</h2>
    <p>Hi ${patientName},</p>
    <p>Your session with <strong>${therapistName}</strong> is confirmed.</p>
    <ul>
      <li>Date: <strong>${date}</strong></li>
      <li>Time: <strong>${time}</strong> (${timezone})</li>
    </ul>
    <p>You can see your bookings in the dashboard.</p>
    <p>— Flexicure</p>
  </div>
  `
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { therapistId, date, time, timezone = "UTC", durationMinutes = 45 } = body || {}

    if (!therapistId || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create SSR client using the caller's cookies (RLS applies as the user)
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Validate intended slot is within therapist availability for the selected local day
    const dow = getLocalDayOfWeek(date, timezone)
    const { data: avail } = await supabase
      .from("availability")
      .select("start_time, end_time")
      .eq("therapist_id", therapistId)
      .eq("day_of_week", dow)

    if (!avail || avail.length === 0) {
      return NextResponse.json({ error: "No availability for selected date" }, { status: 400 })
    }

    const { startISO, endISO } = toUtcStartEndISO(date, time, timezone, durationMinutes)
    const startHHmm = time
    const endLocal = new Date(new Date(`${date}T${time}:00`).getTime() + durationMinutes * 60_000)
      .toTimeString()
      .slice(0, 5)

    // Check candidate lies within at least one availability window (local)
    const within = avail.some((a) => {
      const aStart = (a.start_time as string).slice(0, 5)
      const aEnd = (a.end_time as string).slice(0, 5)
      return aStart <= startHHmm && endLocal <= aEnd
    })
    if (!within) {
      return NextResponse.json({ error: "Selected time not within therapist availability" }, { status: 400 })
    }

    // Check booking conflicts for the therapist (UTC overlap)
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("therapist_id", therapistId)
      .lt("start_time", endISO)
      .gt("end_time", startISO)
      .limit(1)
    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: "Selected time is no longer available" }, { status: 409 })
    }

    // Insert booking as current user (RLS: patient_id must equal auth.uid())
    const { data: profile } = await supabase.from("profiles").select("id, full_name, email").eq("id", user.id).single()
    const { data: th } = await supabase.from("profiles").select("full_name, email").eq("id", therapistId).single()

    const { data: inserted, error: insertError } = await supabase
      .from("bookings")
      .insert({
        patient_id: user.id,
        therapist_id: therapistId,
        start_time: startISO,
        end_time: endISO,
        timezone,
        status: "pending", // therapist can accept/reject later
        amount_cents: 5000,
        currency: "INR",
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // Send confirmation emails (best-effort)
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const resend = new Resend(resendKey)
      const origin = process.env.NEXT_PUBLIC_APP_URL || (await headers()).get("x-forwarded-host")?.startsWith("http") // ensure protocol handling below
      const base =
        process.env.NEXT_PUBLIC_APP_URL || `https://${(await headers()).get("x-forwarded-host") || "localhost:3000"}`

      const html = emailTemplate({
        patientName: profile?.full_name || "there",
        therapistName: th?.full_name || "your therapist",
        date,
        time,
        timezone,
      })

      // Patient
      if (profile?.email) {
        await resend.emails.send({
          from: "Flexicure <notifications@flexicure.app>",
          to: profile.email,
          subject: "Your Flexicure booking is confirmed",
          html,
        })
      }
      // Therapist
      if (th?.email) {
        await resend.emails.send({
          from: "Flexicure <notifications@flexicure.app>",
          to: th.email,
          subject: "New Flexicure booking request",
          html: `
          <div style="font-family: Arial, sans-serif; color: #111">
            <h2>New booking request</h2>
            <p>${profile?.full_name || "A patient"} has requested a session.</p>
            <ul>
              <li>Date: <strong>${date}</strong></li>
              <li>Time: <strong>${time}</strong> (${timezone})</li>
            </ul>
            <p>Visit your dashboard to accept or reject.</p>
          </div>`,
        })
      }
    }

    return NextResponse.json({ booking: inserted })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
