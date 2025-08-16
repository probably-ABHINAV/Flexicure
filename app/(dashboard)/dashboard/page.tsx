import { cookies } from "next/headers"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/ssr"
import { getPostLoginRedirectPath } from "@/lib/auth/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function DashboardLanding() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not signed in</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const redirectTo = await getPostLoginRedirectPath(supabase, user.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose your dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/patient">Patient</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/therapist">Therapist</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin">Admin</Link>
          </Button>
          <Button asChild>
            <Link href={redirectTo}>Go to my role</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
