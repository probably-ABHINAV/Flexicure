import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/ssr"
import { getPostLoginRedirectPath } from "@/lib/auth/roles"

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in?error=No user session")
  }

  const redirectTo = searchParams.next || (await getPostLoginRedirectPath(supabase, user.id))
  redirect(redirectTo)
}
