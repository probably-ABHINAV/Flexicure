"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { z } from "zod"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, UserPlus2 } from "lucide-react"

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  role: z.enum(["patient", "therapist"]),
})

export default function SignUpPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const parse = SignUpSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      full_name: formData.get("full_name"),
      role: formData.get("role"),
    })
    if (!parse.success) {
      setError("Please fill the form correctly.")
      setLoading(false)
      return
    }

    // Create user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parse.data.email,
      password: parse.data.password,
      options: {
        data: {
          full_name: parse.data.full_name,
          // Set the intended role in user metadata; SQL trigger will copy into public.profiles.
          intended_role: parse.data.role,
        },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // If email confirmations are on, they'll verify their email.
    // Redirect to sign-in or directly to dashboard if auto-confirm is enabled.
    if (!data.user) {
      router.push("/auth/sign-in?message=Check your email to confirm your account")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Sign up as a patient or therapist</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Sign-up failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" placeholder="Jane Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <RadioGroup name="role" defaultValue="patient" className="grid grid-cols-2 gap-3">
              <div>
                <RadioGroupItem id="role-patient" value="patient" className="mr-2" />
                <Label htmlFor="role-patient">Patient</Label>
              </div>
              <div>
                <RadioGroupItem id="role-therapist" value="therapist" className="mr-2" />
                <Label htmlFor="role-therapist">Therapist</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus2 className="mr-2 h-4 w-4" />}
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-medium underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
