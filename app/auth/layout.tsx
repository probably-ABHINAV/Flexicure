import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication – Flexicure",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-md px-4 py-10">{children}</div>
}
