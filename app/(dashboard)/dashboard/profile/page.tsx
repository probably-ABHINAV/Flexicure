"use client"

import * as React from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [ok, setOk] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    full_name: "",
    avatar_url: "",
  })

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (!user) {
        setError("No session")
        setLoading(false)
        return
      }
      const { data, error } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single()
      if (error) {
        setError(error.message)
      } else if (mounted) {
        setForm({ full_name: data?.full_name || "", avatar_url: data?.avatar_url || "" })
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [supabase])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setOk(null)
    setSaving(true)
    const { data: auth } = await supabase.auth.getUser()
    const user = auth.user
    if (!user) {
      setError("No session")
      setSaving(false)
      return
    }
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id)
    if (error) {
      setError(error.message)
    } else {
      setOk("Profile updated")
    }
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading profile…
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Update failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {ok && (
              <Alert className="mb-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{ok}</AlertDescription>
              </Alert>
            )}
            <form className="grid gap-4 sm:max-w-md" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={form.avatar_url}
                  placeholder="https://…"
                  onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
                />
              </div>
              <div>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save changes
                </Button>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
