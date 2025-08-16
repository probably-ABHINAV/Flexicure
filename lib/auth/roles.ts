import type { SupabaseClient } from "@supabase/supabase-js"

export type Role = "patient" | "therapist" | "admin"
export const DEFAULT_DASHBOARD_PATH = "/dashboard"

export async function getUserRole(supabase: SupabaseClient, userId: string): Promise<Role | null> {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
  if (error) return null
  return (data?.role as Role) || null
}

export async function getPostLoginRedirectPath(supabase: SupabaseClient, userId: string): Promise<string> {
  const role = await getUserRole(supabase, userId)
  if (role === "patient") return "/dashboard/patient"
  if (role === "therapist") return "/dashboard/therapist"
  if (role === "admin") return "/dashboard/admin"
  return DEFAULT_DASHBOARD_PATH
}
