import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { Resend } from "resend"

export async function POST(req: Request) {
  try {
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()

    if (!bookingId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 })
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex")
    const valid = expectedSignature === razorpay_signature
    if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 })

    const supabase = getSupabaseAdminClient()

    // Update payment...
    const { data: paymentRow } = await supabase
      .from("payments")
      .select("id, amount_cents, currency")
      .eq("provider_reference", razorpay_order_id)
      .maybeSingle()

    if (!paymentRow) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    // Mark paid
    await supabase
      .from("payments")
      .update({ status: "paid", provider_payment_id: razorpay_payment_id })
      .eq("id", paymentRow.id)

    await supabase.from("bookings").update({ payment_status: "paid" }).eq("id", bookingId)

    // Build receipt URL and store it
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      (req.headers.get("x-forwarded-proto") || "https") + "://" + (req.headers.get("x-forwarded-host") || "")
    const receiptUrl = `${base}/dashboard/payments/receipt/${paymentRow.id}`
    await supabase.from("payments").update({ receipt_url: receiptUrl }).eq("id", paymentRow.id)

    // Send confirmation email (best-effort)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      // Fetch recipient email(s)
      const { data: booking } = await supabase
        .from("bookings")
        .select("patient_id, therapist_id, start_time")
        .eq("id", bookingId)
        .single()

      const [{ data: patient }, { data: therapist }] = await Promise.all([
        supabase.from("profiles").select("email, full_name").eq("id", booking?.patient_id).single(),
        supabase.from("profiles").select("email, full_name").eq("id", booking?.therapist_id).single(),
      ])

      const amountString = `${(paymentRow.amount_cents ?? 0) / 100} ${paymentRow.currency}`
      const sessionTime = booking?.start_time ? new Date(booking.start_time).toLocaleString() : "-"

      const html = `
        <div style="font-family: Arial, sans-serif; color: #111">
          <h2>Payment confirmed</h2>
          <p>Thank you! Your payment has been received.</p>
          <ul>
            <li>Amount: <strong>${amountString}</strong></li>
            <li>Receipt: <a href="${receiptUrl}">${receiptUrl}</a></li>
            <li>Session: ${sessionTime}</li>
          </ul>
          <p>— Flexicure</p>
        </div>
      `

      if (patient?.email) {
        await resend.emails.send({
          from: "Flexicure <notifications@flexicure.app>",
          to: patient.email,
          subject: "Your payment is confirmed",
          html,
        })
      }
      if (therapist?.email) {
        await resend.emails.send({
          from: "Flexicure <notifications@flexicure.app>",
          to: therapist.email,
          subject: "Patient payment received",
          html: `
            <div style="font-family: Arial, sans-serif; color: #111">
              <h2>Patient payment received</h2>
              <p>The patient's payment has been confirmed for the upcoming session (${sessionTime}).</p>
            </div>
          `,
        })
      }
    }

    return NextResponse.json({ ok: true, receiptUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
