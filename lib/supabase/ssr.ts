import { createServerClient as createSSRClient } from "@supabase/ssr"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

export function createServerClient(cookies: ReadonlyRequestCookies) {
  // SSR client reads/writes cookies for session handling.
  return createSSRClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value
      },
      set() {
        // Not needed in RSC render
      },
      remove() {
        // Not needed in RSC render
      },
    },
  })
}
