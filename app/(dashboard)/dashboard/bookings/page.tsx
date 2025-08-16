import { cookies } from "next/headers"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/ssr"
import { getUserRole } from "@/lib/auth/roles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function BookingsListPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const role = await getUserRole(supabase, user.id)

  const filterColumn = role === "therapist" ? "therapist_id" : "patient_id"
  const { data: bookings } = await supabase
    .from("bookings_view")
    .select("*")
    .eq(filterColumn, user.id)
    .order("start_time", { ascending: false })

  function getStatusBadge(status: string) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      accepted: "default",
      rejected: "destructive",
      completed: "secondary",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  function getPaymentBadge(status: string) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      unpaid: "outline",
      paid: "default",
      refunded: "secondary",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bookings</CardTitle>
        {role === "patient" && (
          <Button asChild>
            <Link href="/dashboard/bookings/new">New Booking</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Date & Time</th>
                <th className="p-2">{role === "therapist" ? "Patient" : "Therapist"}</th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(bookings || []).map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{new Date(b.start_time).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(b.start_time).toLocaleTimeString()} - {new Date(b.end_time).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">{role === "therapist" ? b.patient_name : b.therapist_name}</td>
                  <td className="p-2">{getStatusBadge(b.status)}</td>
                  <td className="p-2">{getPaymentBadge(b.payment_status)}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      {b.daily_room_url ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/video?booking=${b.id}`}>Join Video</Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/video?booking=${b.id}`}>Create Room</Link>
                        </Button>
                      )}
                      {role === "patient" && b.payment_status !== "paid" && (
                        <Button asChild size="sm">
                          <Link href={`/dashboard/payments/checkout?booking=${b.id}`}>Pay</Link>
                        </Button>
                      )}
                      {role === "therapist" && b.status === "pending" && (
                        <>
                          <Button asChild size="sm">
                            <Link href={`/dashboard/bookings/manage/${b.id}`}>Manage</Link>
                          </Button>
                        </>
                      )}
                      {role === "patient" && b.status === "completed" && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/bookings/review/${b.id}`}>Review</Link>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!bookings?.length && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={5}>
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
