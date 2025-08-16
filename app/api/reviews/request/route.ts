import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { Resend } from "resend"

// POST /api/reviews/request - Send review request email after completed session
export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    if (!bookingId) return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })

    const supabase = getSupabaseAdminClient()

    // Get booking details
    const { data: booking } = await supabase
      .from("bookings_view")
      .select("id, patient_id, therapist_id, patient_name, therapist_name, start_time, status")
      .eq("id", bookingId)
      .single()

    if (!booking || booking.status !== "completed") {
      return NextResponse.json({ error: "Booking not found or not completed" }, { status: 404 })
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json({ message: "Review already exists" })
    }

    // Get patient email
    const { data: patient } = await supabase.from("profiles").select("email").eq("id", booking.patient_id).single()

    if (!patient?.email) {
      return NextResponse.json({ error: "Patient email not found" }, { status: 404 })
    }

    // Send review request email
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const resend = new Resend(resendKey)
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("x-forwarded-host") || ""}`

    const reviewUrl = `${base}/dashboard/bookings/review/${bookingId}`

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px;">
        <h2>How was your session?</h2>
        <p>Hi ${booking.patient_name || "there"},</p>
        <p>We hope you had a great session with <strong>${booking.therapist_name}</strong> on ${new Date(booking.start_time).toLocaleDateString()}.</p>
        <p>Your feedback helps other patients find the right therapist and helps us improve our service.</p>
        <div style="margin: 24px 0;">
          <a href="${reviewUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Leave a Review
          </a>
        </div>
        <p>Thank you for using Flexicure!</p>
        <p style="color: #666; font-size: 14px;">
          If you're having trouble with the button above, copy and paste this link into your browser:<br>
          ${reviewUrl}
        </p>
      </div>
    `

    await resend.emails.send({
      from: "Flexicure <notifications@flexicure.app>",
      to: patient.email,
      subject: `How was your session with ${booking.therapist_name}?`,
      html,
    })

    return NextResponse.json({ message: "Review request sent" })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
