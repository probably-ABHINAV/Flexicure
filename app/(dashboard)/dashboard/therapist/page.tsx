import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/ssr"
import { getUserRole } from "@/lib/auth/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TherapistDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const role = await getUserRole(supabase, user.id)
  if (role !== "therapist") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
        </CardHeader>
        <CardContent>Please switch to a therapist account.</CardContent>
      </Card>
    )
  }

  const { data: pending } = await supabase
    .from("bookings_view")
    .select("*")
    .eq("therapist_id", user.id)
    .eq("status", "pending")
    .order("start_time", { ascending: true })
    .limit(5)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pending bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {(pending || []).map((b) => (
              <li key={b.id} className="flex items-center justify-between">
                <span>
                  {new Date(b.start_time).toLocaleString()} – {b.patient_name}
                </span>
                <span className="text-xs text-muted-foreground">{b.status}</span>
              </li>
            ))}
            {!pending?.length && <li className="text-muted-foreground">No pending bookings.</li>}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Manage your availability and sync your calendar.
        </CardContent>
      </Card>
    </div>
  )
}
