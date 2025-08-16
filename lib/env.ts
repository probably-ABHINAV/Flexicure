const get = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback
  if (typeof window === "undefined" && value === undefined) {
    throw new Error(`Missing required env var: ${key}`)
  }
  return value ?? ""
}

export const publicEnv = {
  NEXT_PUBLIC_APP_URL: get("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: get("NEXT_PUBLIC_SUPABASE_URL", ""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
}

export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM || "",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  DAILY_API_KEY: process.env.DAILY_API_KEY || "",
}
