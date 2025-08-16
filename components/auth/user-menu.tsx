"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type UserInfo = {
  id: string
  email?: string
  name?: string
}

export function UserMenu() {
  const router = useRouter()
  const supabaseRef = React.useRef<SupabaseClient | null>(null)
  const [configured, setConfigured] = React.useState(false)
  const [user, setUser] = React.useState<UserInfo | null>(null)

  // Detect configuration once on mount and only initialize Supabase if configured.
  React.useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      setConfigured(false)
      return
    }
    setConfigured(true)

    // Lazily create the client
    try {
      const supabase = getSupabaseBrowserClient()
      supabaseRef.current = supabase

      // Load initial user
      supabase.auth.getUser().then(({ data }) => {
        const u = data.user
        if (u) {
          setUser({
            id: u.id,
            email: u.email || undefined,
            name: (u.user_metadata?.full_name as string) || undefined,
          })
        } else {
          setUser(null)
        }
      })

      // Subscribe to auth changes
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user
        if (u) {
          setUser({
            id: u.id,
            email: u.email || undefined,
            name: (u.user_metadata?.full_name as string) || undefined,
          })
        } else {
          setUser(null)
        }
      })

      return () => {
        sub?.subscription?.unsubscribe?.()
      }
    } catch {
      // If anything goes wrong (e.g., missing config), render unauthenticated state.
      setConfigured(false)
      setUser(null)
    }
  }, [])

  async function signOut() {
    try {
      await supabaseRef.current?.auth.signOut()
    } finally {
      router.push("/")
      router.refresh()
    }
  }

  // If Supabase isn’t configured yet, show static auth buttons (no client usage).
  if (!configured) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    )
  }

  // Configured but no user: show auth buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    )
  }

  const initials =
    user.name
      ?.trim()
      ?.split(" ")
      ?.slice(0, 2)
      ?.map((s) => s[0]?.toUpperCase())
      ?.join("") ||
    user.email?.slice(0, 2).toUpperCase() ||
    "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="max-w-[200px] truncate">{user.name || user.email || "Account"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
