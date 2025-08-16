import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/ssr"
import { getUserRole } from "@/lib/auth/roles"
import AvailabilityClient from "./client"

export default async function AvailabilityPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in?redirect=/dashboard/availability")

  const role = await getUserRole(supabase, user.id)
  if (role !== "therapist") redirect("/dashboard")

  // Prefetch current slots
  const { data: slots } = await supabase
    .from("availability")
    .select("id, day_of_week, start_time, end_time")
    .eq("therapist_id", user.id)
    .order("day_of_week, start_time")

  return <AvailabilityClient initialSlots={slots ?? []} />
}
