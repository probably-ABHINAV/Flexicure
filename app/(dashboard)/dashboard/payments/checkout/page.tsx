"use client"

import { useSearchParams, useRouter } from "next/navigation"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const search = useSearchParams()
  const router = useRouter()
  const bookingId = search.get("booking")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function startPayment() {
    setError(null)
    if (!bookingId) return
    setLoading(true)

    // Create order on server
    const res = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data?.error || "Failed to create order")
      setLoading(false)
      return
    }

    // Load Razorpay JS if needed
    if (typeof window !== "undefined" && !window.Razorpay) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script")
          script.src = "https://checkout.razorpay.com/v1/checkout.js"
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      } catch {
        setError("Failed to load Razorpay SDK")
        setLoading(false)
        return
      }
    }

    const options = {
      key: data.keyId,
      amount: data.amount, // minor units
      currency: data.currency,
      name: "Flexicure",
      description: "Physiotherapy session",
      order_id: data.orderId,
      handler: async (response: any) => {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, ...response }),
        })
        const verifyJson = await verifyRes.json()
        if (!verifyRes.ok) {
          setError(verifyJson?.error || "Payment verification failed")
        } else {
          router.push("/dashboard/payments")
        }
      },
      theme: { color: "#16a34a" },
    }
    const rp = new window.Razorpay(options)
    rp.on("payment.failed", () => {
      setError("Payment failed. Please try again.")
    })
    rp.open()
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Proceed to payment for your booking.</p>
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Payment error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="mt-4">
          <Button onClick={startPayment} disabled={!bookingId || loading}>
            {loading ? "Starting..." : "Pay with Razorpay"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
