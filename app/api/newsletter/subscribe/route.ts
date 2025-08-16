import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { Resend } from "resend"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: "Already subscribed" })
    }

    // Add to newsletter
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.toLowerCase() })

    if (error) {
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
    }

    // Send welcome email (optional)
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const resend = new Resend(resendKey)
      const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

      await resend.emails.send({
        from: "Flexicure <notifications@flexicure.app>",
        to: email,
        subject: "Welcome to Flexicure Newsletter!",
        html: `
          <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px;">
            <h2>Welcome to Flexicure!</h2>
            <p>Thank you for subscribing to our newsletter. You'll receive:</p>
            <ul>
              <li>Expert physiotherapy tips and advice</li>
              <li>Remote care best practices</li>
              <li>Platform updates and new features</li>
              <li>Wellness and recovery insights</li>
            </ul>
            <p>Visit our <a href="${base}/blog">blog</a> to read our latest articles.</p>
            <p>— The Flexicure Team</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You can unsubscribe at any time by replying to any of our emails.
            </p>
          </div>
        `,
      })
    }

    return NextResponse.json({ message: "Successfully subscribed" })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
