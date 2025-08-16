import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { to, body } = await req.json()
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_WHATSAPP_FROM
    if (!sid || !token || !from) {
      return NextResponse.json({ error: "Twilio not configured" }, { status: 500 })
    }
    const auth = Buffer.from(`${sid}:${token}`).toString("base64")
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        From: from,
        To: to,
        Body: body,
      }),
    })
    const json = await res.json()
    if (!res.ok) return NextResponse.json({ error: json?.message || "Twilio error" }, { status: res.status })
    return NextResponse.json({ ok: true, sid: json.sid })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
