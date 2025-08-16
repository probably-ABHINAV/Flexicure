import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    if (!bookingId) return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 })
    }

    const supabase = getSupabaseAdminClient()
    const { data: booking, error } = await supabase.from("bookings").select("*").eq("id", bookingId).single()
    if (error || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    const amountMinor = booking.amount_cents || 5000 // store as minor units (paise/cents)
    const currency = booking.currency || "INR"

    // Create order
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountMinor,
        currency,
        receipt: `booking_${bookingId}`,
        payment_capture: 1,
      }),
    })
    const json = await r.json()
    if (!r.ok) {
      const msg = json?.error?.description || "Failed to create order"
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // Record created payment
    await supabase.from("payments").insert({
      booking_id: bookingId,
      provider: "razorpay",
      status: "created",
      amount_cents: amountMinor,
      currency,
      provider_reference: json.id, // order_id
    })

    return NextResponse.json({ orderId: json.id, amount: amountMinor, currency, keyId })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
