"use client"

import * as React from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Trash2 } from "lucide-react"

type Slot = { id: string; day_of_week: number; start_time: string; end_time: string }

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function AvailabilityClient({ initialSlots }: { initialSlots: Slot[] }) {
  const supabase = getSupabaseBrowserClient()
  const [slots, setSlots] = React.useState<Slot[]>(initialSlots)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<{ day_of_week: number | ""; start_time: string; end_time: string }>({
    day_of_week: "",
    start_time: "",
    end_time: "",
  })

  async function addSlot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (form.day_of_week === "" || !form.start_time || !form.end_time) return
    setSaving(true)
    const { data: auth } = await supabase.auth.getUser()
    const u = auth.user
    if (!u) return
    const { data, error } = await supabase
      .from("availability")
      .insert({
        therapist_id: u.id,
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
      })
      .select()
      .single()
    if (!error && data) {
      setSlots((s) => [...s, data as Slot].sort(sortSlots))
      setForm({ day_of_week: "", start_time: "", end_time: "" })
    }
    setSaving(false)
  }

  async function removeSlot(id: string) {
    setSaving(true)
    await supabase.from("availability").delete().eq("id", id)
    setSlots((s) => s.filter((x) => x.id !== id))
    setSaving(false)
  }

  function sortSlots(a: Slot, b: Slot) {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week
    return a.start_time.localeCompare(b.start_time)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-4" onSubmit={addSlot}>
          <div className="space-y-2">
            <Label>Day</Label>
            <Select
              value={form.day_of_week === "" ? undefined : String(form.day_of_week)}
              onValueChange={(v) => setForm((f) => ({ ...f, day_of_week: Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d, i) => (
                  <SelectItem key={d} value={String(i)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start</Label>
            <Input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add
            </Button>
          </div>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Day</th>
                <th className="p-2">Start</th>
                <th className="p-2">End</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{days[s.day_of_week]}</td>
                  <td className="p-2">{s.start_time}</td>
                  <td className="p-2">{s.end_time}</td>
                  <td className="p-2">
                    <Button variant="outline" size="sm" onClick={() => removeSlot(s.id)} disabled={saving}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
              {!slots.length && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={4}>
                    No availability set yet.
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
