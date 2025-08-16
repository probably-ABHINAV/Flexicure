"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Calendar, Home, Users2, Shield, Video, CreditCard, UserCog, Star } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type Role = "patient" | "therapist" | "admin" | null

const baseNav = [
  { title: "Overview", url: "/dashboard", icon: Home, roles: ["patient", "therapist", "admin"] },
  { title: "Bookings", url: "/dashboard/bookings", icon: Calendar, roles: ["patient", "therapist", "admin"] },
  { title: "Payments", url: "/dashboard/payments", icon: CreditCard, roles: ["patient", "therapist", "admin"] },
  { title: "Video", url: "/dashboard/video", icon: Video, roles: ["patient", "therapist", "admin"] },
  { title: "Patients", url: "/dashboard/patients", icon: Users2, roles: ["therapist"] },
  { title: "Availability", url: "/dashboard/availability", icon: UserCog, roles: ["therapist"] },
  { title: "Admin", url: "/dashboard/admin", icon: Shield, roles: ["admin"] },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star, roles: ["patient", "therapist"] },
  { title: "Therapists", url: "/dashboard/therapists", icon: Users2, roles: ["patient"] },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [role, setRole] = React.useState<Role>(null)

  React.useEffect(() => {
    // Detect Supabase configuration (avoid errors if env not set yet)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setRole(null)
      return
    }
    const supabase = getSupabaseBrowserClient()
    let mounted = true
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (!user) return
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      if (!mounted) return
      setRole((data?.role as Role) ?? null)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const items = baseNav.filter((i) => !i.roles || (role && i.roles.includes(role)))

  return (
    <Sidebar {...props}>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.url)} tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
