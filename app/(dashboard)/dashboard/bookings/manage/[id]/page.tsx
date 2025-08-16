"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type Booking = {
  id: string
  patient_name: string
  therapist_name: string
  start_time: string
  end_time: string
  status: string
  payment_status: string
}

export default function ManageBookingPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const [booking, setBooking] = React.useState<Booking | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data, error } = await supabase
        .from("bookings_view")
        .select("id, patient_name, therapist_name, start_time, end_time, status, payment_status")
        .eq("id", params.id)
        .single()
      if (!mounted) return
      if (error) {
        setError(error.message)
      } else {
        setBooking(data as Booking)
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [params.id, supabase])

  async function updateStatus(newStatus: "accepted" | "rejected") {
    setError(null)
    setUpdating(true)
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", params.id)
    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard/bookings")
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading booking...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!booking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">The booking could not be found or you don't have access.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Booking</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patient:</span>
              <span>{booking.patient_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(booking.start_time).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span>
                {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{booking.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <span className="capitalize">{booking.payment_status}</span>
            </div>
          </div>

          {booking.status === "pending" && (
            <div className="flex gap-3 pt-4">
              <Button onClick={() => updateStatus("accepted")} disabled={updating}>
                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Accept
              </Button>
              <Button variant="outline" onClick={() => updateStatus("rejected")} disabled={updating}>
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
