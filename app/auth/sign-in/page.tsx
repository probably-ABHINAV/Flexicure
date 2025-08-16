"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { z } from "zod"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Github, Mail, Loader2, ShieldCheck } from "lucide-react"

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default function SignInPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const redirectTo = searchParams.get("redirect") || "/dashboard"

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const parse = SignInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })
    if (!parse.success) {
      setError("Please provide a valid email and password.")
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parse.data.email,
      password: parse.data.password,
    })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
  }

  async function signInWithProvider(provider: "google" | "github") {
    setError(null)
    setLoading(true)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
            : undefined,
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your Flexicure account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Sign-in failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Sign in
          </Button>
        </form>
        <div className="my-4 h-px bg-border" />
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => signInWithProvider("google")}
            disabled={loading}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => signInWithProvider("github")}
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="font-medium underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
