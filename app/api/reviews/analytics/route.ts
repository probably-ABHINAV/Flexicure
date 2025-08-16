import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const days = Number.parseInt(searchParams.get("days") || "30")
    const therapistId = searchParams.get("therapistId")

    const supabase = getSupabaseAdminClient()

    // Base query for reviews
    let query = supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        therapist_id,
        patient_id,
        booking_id
      `)
      .gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

    if (therapistId) {
      query = query.eq("therapist_id", therapistId)
    }

    const { data: reviews, error } = await query

    if (error) {
      console.error("Failed to fetch reviews:", error)
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }

    // Calculate analytics
    const totalReviews = reviews?.length || 0
    const averageRating =
      totalReviews > 0 ? (reviews!.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) : "0.0"

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews?.filter((r) => r.rating === rating).length || 0,
      percentage:
        totalReviews > 0
          ? Math.round(((reviews?.filter((r) => r.rating === rating).length || 0) / totalReviews) * 100)
          : 0,
    }))

    // Reviews over time (last 30 days)
    const reviewsOverTime = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const dayReviews = reviews?.filter((r) => r.created_at.startsWith(dateStr)) || []

      reviewsOverTime.push({
        date: dateStr,
        count: dayReviews.length,
        averageRating:
          dayReviews.length > 0
            ? (dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length).toFixed(1)
            : "0.0",
      })
    }

    // Top therapists by rating (if not filtering by specific therapist)
    let topTherapists = []
    if (!therapistId) {
      const therapistStats = new Map()

      reviews?.forEach((review) => {
        if (!therapistStats.has(review.therapist_id)) {
          therapistStats.set(review.therapist_id, {
            therapistId: review.therapist_id,
            totalRating: 0,
            reviewCount: 0,
            ratings: [],
          })
        }

        const stats = therapistStats.get(review.therapist_id)
        stats.totalRating += review.rating
        stats.reviewCount += 1
        stats.ratings.push(review.rating)
      })

      topTherapists = Array.from(therapistStats.values())
        .map((stats) => ({
          therapistId: stats.therapistId,
          averageRating: (stats.totalRating / stats.reviewCount).toFixed(1),
          reviewCount: stats.reviewCount,
        }))
        .sort((a, b) => Number.parseFloat(b.averageRating) - Number.parseFloat(a.averageRating))
        .slice(0, 10)
    }

    // Recent reviews with sentiment analysis (mock)
    const recentReviews =
      reviews
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map((review) => ({
          ...review,
          sentiment: review.rating >= 4 ? "positive" : review.rating >= 3 ? "neutral" : "negative",
          wordCount: review.comment ? review.comment.split(" ").length : 0,
        })) || []

    return NextResponse.json({
      summary: {
        totalReviews,
        averageRating: Number.parseFloat(averageRating),
        period: `${days} days`,
      },
      ratingDistribution,
      reviewsOverTime,
      topTherapists,
      recentReviews,
      trends: {
        ratingTrend: calculateTrend(reviewsOverTime.map((r) => Number.parseFloat(r.averageRating))),
        volumeTrend: calculateTrend(reviewsOverTime.map((r) => r.count)),
      },
    })
  } catch (error) {
    console.error("Review analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateTrend(values: number[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable"

  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

  const change = ((secondAvg - firstAvg) / firstAvg) * 100

  if (change > 5) return "up"
  if (change < -5) return "down"
  return "stable"
}
