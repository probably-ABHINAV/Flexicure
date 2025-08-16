import { cookies } from "next/headers"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type PaymentRow = {
  id: string
  booking_id: string
  provider: string
  status: string
  amount_cents: number
  currency: string
  receipt_url: string | null
  created_at: string
}

export const metadata = {
  title: "Payments – Flexicure",
}

export default async function PaymentsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sign in to view your payments.</p>
        </CardContent>
      </Card>
    )
  }

  const { data, error } = await supabase
    .from("payments")
    .select("id, booking_id, provider, status, amount_cents, currency, receipt_url, created_at")
    .order("created_at", { ascending: false })
  const rows = (data as PaymentRow[] | null) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-red-600">{error.message}</p>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Provider</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="p-2">
                      {(p.amount_cents ?? 0) / 100} {p.currency}
                    </td>
                    <td className="p-2">{p.status}</td>
                    <td className="p-2">{p.provider}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {p.status === "paid" ? (
                          <>
                            <Button asChild size="sm" variant="outline">
                              <Link href={p.receipt_url || `/dashboard/payments/receipt/${p.id}`}>View receipt</Link>
                            </Button>
                            <Button asChild size="sm">
                              <Link href={`/dashboard/bookings`}>View booking</Link>
                            </Button>
                          </>
                        ) : (
                          <Button asChild size="sm">
                            <Link href={`/dashboard/payments/checkout?booking=${p.booking_id}`}>Complete payment</Link>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
