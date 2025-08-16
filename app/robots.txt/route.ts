import { NextResponse } from "next/server"

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
