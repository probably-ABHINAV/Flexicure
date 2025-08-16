"use client"

import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ReceiptClientPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: payment } = await supabase
    .from("payments")
    .select("id, booking_id, status, amount_cents, currency, provider, created_at, provider_payment_id")
    .eq("id", params.id)
    .maybeSingle()

  if (!payment || payment.status !== "paid") return notFound()

  const { data: booking } = await supabase
    .from("bookings")
    .select("start_time, therapist_id, patient_id")
    .eq("id", payment.booking_id)
    .single()

  const { data: therapist } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", booking?.therapist_id)
    .single()

  const { data: patient } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", booking?.patient_id)
    .single()

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Payment Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>Receipt ID</span>
              <span className="font-mono">{payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Provider</span>
              <span>{payment.provider}</span>
            </div>
            <div className="flex justify-between">
              <span>Provider Payment ID</span>
              <span className="font-mono">{payment.provider_payment_id || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span>{new Date(payment.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount</span>
              <span>
                {(payment.amount_cents ?? 0) / 100} {payment.currency}
              </span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between">
              <span>Patient</span>
              <span>{patient?.full_name || "Patient"}</span>
            </div>
            <div className="flex justify-between">
              <span>Therapist</span>
              <span>{therapist?.full_name || "Therapist"}</span>
            </div>
            <div className="flex justify-between">
              <span>Session time</span>
              <span>{booking?.start_time ? new Date(booking.start_time).toLocaleString() : "-"}</span>
            </div>
            <div className="mt-4 flex gap-2 print:hidden">
              <Button onClick={() => window.print()}>Print</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
