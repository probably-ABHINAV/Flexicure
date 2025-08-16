import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { Resend } from "resend"

// POST /api/reviews/automated-request - Automatically send review requests for completed sessions
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdminClient()

    // Find completed bookings from the last 24 hours that don't have reviews yet
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: completedBookings, error: bookingsError } = await supabase
      .from("bookings_view")
      .select(`
        id,
        patient_id,
        therapist_id,
        patient_name,
        therapist_name,
        patient_email,
        start_time,
        status,
        end_time
      `)
      .eq("status", "completed")
      .gte("end_time", oneDayAgo)

    if (bookingsError) {
      console.error("Failed to fetch completed bookings:", bookingsError)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }

    if (!completedBookings || completedBookings.length === 0) {
      return NextResponse.json({ message: "No completed bookings found", sent: 0 })
    }

    // Check which bookings already have reviews
    const bookingIds = completedBookings.map((b) => b.id)
    const { data: existingReviews } = await supabase.from("reviews").select("booking_id").in("booking_id", bookingIds)

    const reviewedBookingIds = new Set(existingReviews?.map((r) => r.booking_id) || [])

    // Filter out bookings that already have reviews
    const bookingsNeedingReviews = completedBookings.filter((booking) => !reviewedBookingIds.has(booking.id))

    if (bookingsNeedingReviews.length === 0) {
      return NextResponse.json({ message: "All completed bookings already have reviews", sent: 0 })
    }

    // Send review request emails
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const resend = new Resend(resendKey)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://flexicure.app"

    let emailsSent = 0
    const emailPromises = bookingsNeedingReviews.map(async (booking) => {
      if (!booking.patient_email) return false

      const reviewUrl = `${baseUrl}/dashboard/bookings/review/${booking.id}`

      const html = `
        <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">#667eea 0%,#764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">How was your session?</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${booking.patient_name || "there"},</p>
            
            <p style="line-height: 1.6; margin-bottom: 20px;">
              We hope you had a great session with <strong>${booking.therapist_name}</strong> on 
              ${new Date(booking.start_time).toLocaleDateString()}.
            </p>
            
            <p style="line-height: 1.6; margin-bottom: 30px;">
              Your feedback helps other patients find the right therapist and helps us improve our service. 
              It only takes 2 minutes to share your experience.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                ⭐ Leave a Review
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Session Details:</h3>
              <p style="margin: 5px 0; color: #666;">
                <strong>Therapist:</strong> ${booking.therapist_name}<br>
                <strong>Date:</strong> ${new Date(booking.start_time).toLocaleDateString()}<br>
                <strong>Duration:</strong> ${Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60))} minutes
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Thank you for choosing Flexicure for your physiotherapy needs!
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you're having trouble with the button above, copy and paste this link into your browser:<br>
              <a href="${reviewUrl}" style="color: #667eea;">${reviewUrl}</a>
            </p>
          </div>
        </div>
      `

      try {
        await resend.emails.send({
          from: "Flexicure <reviews@flexicure.app>",
          to: booking.patient_email,
          subject: `How was your session with ${booking.therapist_name}?`,
          html,
        })
        return true
      } catch (error) {
        console.error(`Failed to send review request to ${booking.patient_email}:`, error)
        return false
      }
    })

    const results = await Promise.all(emailPromises)
    emailsSent = results.filter(Boolean).length

    // Log the automated request activity
    await supabase
      .from("review_request_log")
      .insert({
        booking_ids: bookingsNeedingReviews.map((b) => b.id),
        emails_sent: emailsSent,
        total_eligible: bookingsNeedingReviews.length,
        created_at: new Date().toISOString(),
      })
      .catch((error) => {
        console.error("Failed to log review request activity:", error)
      })

    return NextResponse.json({
      message: "Automated review requests sent",
      sent: emailsSent,
      eligible: bookingsNeedingReviews.length,
      total_completed: completedBookings.length,
    })
  } catch (error) {
    console.error("Automated review request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/reviews/automated-request - Get automation settings and stats
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()

    // Get recent automation activity
    const { data: recentActivity } = await supabase
      .from("review_request_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    // Calculate stats for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: monthlyStats } = await supabase
      .from("review_request_log")
      .select("emails_sent, total_eligible")
      .gte("created_at", thirtyDaysAgo)

    const totalSent = monthlyStats?.reduce((sum, log) => sum + log.emails_sent, 0) || 0
    const totalEligible = monthlyStats?.reduce((sum, log) => sum + log.total_eligible, 0) || 0
    const successRate = totalEligible > 0 ? Math.round((totalSent / totalEligible) * 100) : 0

    return NextResponse.json({
      automation: {
        enabled: true,
        frequency: "daily",
        lastRun: recentActivity?.[0]?.created_at || null,
      },
      stats: {
        last30Days: {
          emailsSent: totalSent,
          eligible: totalEligible,
          successRate: `${successRate}%`,
        },
      },
      recentActivity: recentActivity || [],
    })
  } catch (error) {
    console.error("Get automated review request settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
