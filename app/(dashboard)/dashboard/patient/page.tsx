import { cookies } from "next/headers"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/ssr"
import { getUserRole } from "@/lib/auth/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function PatientDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const role = await getUserRole(supabase, user.id)
  if (role !== "patient") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
        </CardHeader>
        <CardContent>Please switch to a patient account.</CardContent>
      </Card>
    )
  }

  const { data: upcoming } = await supabase
    .from("bookings_view")
    .select("*")
    .eq("patient_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {(upcoming || []).map((b) => (
              <li key={b.id} className="flex items-center justify-between">
                <span>
                  {new Date(b.start_time).toLocaleString()} – {b.therapist_name}
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/video?booking=${b.id}`}>Join</Link>
                </Button>
              </li>
            ))}
            {!upcoming?.length && <li className="text-muted-foreground">No upcoming sessions.</li>}
          </ul>
          <div className="mt-4">
            <Button asChild>
              <Link href="/dashboard/bookings/new">Book a session</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History & receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View past sessions, access exercise plans, and download receipts.
          </p>
          <div className="mt-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/bookings">View all bookings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
