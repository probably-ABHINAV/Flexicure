import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/ssr"
import { getUserRole } from "@/lib/auth/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Row = {
  patient_id: string
  patient_name: string
  last_session: string | null
  sessions: number
}

export default async function PatientsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in?redirect=/dashboard/patients")
  const role = await getUserRole(supabase, user.id)
  if (role !== "therapist") redirect("/dashboard")

  // Aggregate patient list for this therapist
  const { data, error } = await supabase
    .from("bookings_view")
    .select("patient_id, patient_name, start_time")
    .eq("therapist_id", user.id)
    .order("start_time", { ascending: false })

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-red-600">{error.message}</CardContent>
      </Card>
    )
  }

  const map = new Map<string, Row>()
  for (const b of data || []) {
    const key = b.patient_id as string
    const r = map.get(key)
    if (!r) {
      map.set(key, {
        patient_id: key,
        patient_name: b.patient_name as string,
        last_session: b.start_time as string,
        sessions: 1,
      })
    } else {
      r.sessions += 1
    }
  }
  const rows = Array.from(map.values())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Sessions</th>
                <th className="p-2">Last session</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.patient_id} className="border-b">
                  <td className="p-2">{r.patient_name}</td>
                  <td className="p-2">{r.sessions}</td>
                  <td className="p-2">{r.last_session ? new Date(r.last_session).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={3}>
                    No patients yet.
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
