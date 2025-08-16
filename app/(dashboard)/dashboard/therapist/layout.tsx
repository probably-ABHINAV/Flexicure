import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/ssr"
import { getUserRole } from "@/lib/auth/roles"

export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in?redirect=/dashboard/therapist")

  const role = await getUserRole(supabase, user.id)
  if (role !== "therapist") redirect("/dashboard")

  return <>{children}</>
}
