"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { publicEnv } from "@/lib/env"

declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowserClient must be used on the client.")
  }
  if (!globalThis.__supabase__) {
    globalThis.__supabase__ = createClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: { persistSession: true, autoRefreshToken: true },
      },
    )
  }
  return globalThis.__supabase__
}
