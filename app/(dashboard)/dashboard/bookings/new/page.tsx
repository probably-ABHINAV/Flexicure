"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

const FormSchema = z.object({
  therapist_id: z.string().uuid(),
  date: z.date(),
  time: z.string(), // HH:mm
  timezone: z.string(),
})

const getDefaultTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

export default function NewBookingPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const search = useSearchParams()
  const [therapists, setTherapists] = React.useState<{ id: string; full_name: string }[]>([])
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [therapistId, setTherapistId] = React.useState<string | undefined>(undefined)
  const [timezone, setTimezone] = React.useState<string>(getDefaultTimezone())
  const [slots, setSlots] = React.useState<string[]>([])
  const [selectedTime, setSelectedTime] = React.useState<string | undefined>(undefined)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load approved therapists for selection
  React.useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await supabase
        .from("therapists_view")
        .select("id, full_name, status")
        .eq("status", "approved")
        .order("full_name")
      if (!active) return
      setTherapists((data as any[]) || [])

      // Pre-select therapist from URL params
      const urlTherapistId = search.get("therapist")
      if (urlTherapistId && data?.some((t) => t.id === urlTherapistId)) {
        setTherapistId(urlTherapistId)
      }
    })()
    return () => {
      active = false
    }
  }, [supabase, search])

  // When therapist/date/timezone changes, load slots
  React.useEffect(() => {
    async function fetchSlots() {
      setSlots([])
      setSelectedTime(undefined)
      setError(null)
      if (!therapistId || !date) return
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, "0")
      const dd = String(date.getDate()).padStart(2, "0")
      const dayStr = `${yyyy}-${mm}-${dd}`
      const res = await fetch(
        `/api/bookings/slots?therapistId=${encodeURIComponent(therapistId)}&date=${dayStr}&timezone=${encodeURIComponent(timezone)}`,
      )
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || "Failed to load slots")
        return
      }
      setSlots(json.slots || [])
    }
    fetchSlots()
  }, [therapistId, date, timezone])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!therapistId || !date || !selectedTime) {
        setError("Please pick a therapist, date, and time.")
        setLoading(false)
        return
      }
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, "0")
      const dd = String(date.getDate()).padStart(2, "0")
      const dayStr = `${yyyy}-${mm}-${dd}`

      // Server-side creation (RLS under current user), and email confirmation
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId,
          date: dayStr,
          time: selectedTime,
          timezone,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || "Failed to create booking")
        setLoading(false)
        return
      }

      router.push("/dashboard/bookings")
    } catch (e: any) {
      setError(e?.message || "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  const timezones = Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : ["UTC"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a session</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Booking failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="grid gap-6 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Therapist</Label>
              <Select onValueChange={(v) => setTherapistId(v)} value={therapistId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose therapist" />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select onValueChange={(v) => setTimezone(v)} value={timezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button type="submit" disabled={loading || !therapistId || !date || !selectedTime}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm booking
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border p-2">
              <Calendar mode="single" selected={date} onSelect={setDate as any} className="mx-auto" />
            </div>

            <div>
              <Label className="mb-2 block">Available times</Label>
              {therapistId && date ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.length ? (
                    slots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`rounded-md border px-3 py-2 text-sm ${
                          selectedTime === t ? "border-green-600 bg-green-50 text-green-700" : "hover:bg-muted"
                        }`}
                      >
                        {t}
                      </button>
                    ))
                  ) : (
                    <p className="col-span-3 text-sm text-muted-foreground sm:col-span-4">No slots for this day.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a therapist and date to see available times.</p>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
