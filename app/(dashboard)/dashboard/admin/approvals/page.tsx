"use client"

import * as React from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type Therapist = {
  id: string
  full_name: string
  status: "pending" | "approved" | "rejected"
}

export default function AdminApprovalsPage() {
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<Therapist[]>([])

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data, error } = await supabase
        .from("therapists_view")
        .select("id, full_name, status")
        .eq("status", "pending")
        .order("full_name")
      if (!mounted) return
      if (!error) setRows((data as Therapist[]) || [])
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [supabase])

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setLoading(true)
    const { error } = await supabase.from("therapists").update({ status }).eq("id", id)
    if (!error) {
      setRows((r) => r.filter((x) => x.id !== id))
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Therapist approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-2">{t.full_name}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStatus(t.id, "approved")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "rejected")}>
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pending applications.</p>
        )}
      </CardContent>
    </Card>
  )
}
