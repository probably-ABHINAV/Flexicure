import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function Trend({ values }: { values: number[] }) {
  const max = Math.max(1, ...values)
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ")
  return (
    <svg width="100%" height="48" viewBox="0 0 100 100" preserveAspectRatio="none" className="text-green-600">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  )
}

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const { data: metrics } = await supabase.rpc("dashboard_metrics")
  const values = [4, 7, 3, 9, 12, 8, 10] // placeholder weekly trend

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">{metrics?.users_count ?? 0}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bookings (30d)</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">{metrics?.bookings_30d ?? 0}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payments (30d)</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {(metrics?.payments_sum_30d_cents ?? 0) / 100} {metrics?.currency ?? "INR"}
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Appointments trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Trend values={values} />
        </CardContent>
      </Card>
    </div>
  )
}
