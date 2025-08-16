"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, CheckCircle } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "Thanks for subscribing! Check your email to confirm." })
        setEmail("")
      } else {
        setMessage({ type: "error", text: data.error || "Failed to subscribe" })
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" />
          Stay Updated
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Get the latest physiotherapy tips and platform updates delivered to your inbox.
        </p>

        {message && (
          <Alert className={`mb-4 ${message.type === "success" ? "border-green-200 bg-green-50" : ""}`}>
            {message.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
            <AlertDescription className={message.type === "success" ? "text-green-800" : ""}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Subscribe
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
