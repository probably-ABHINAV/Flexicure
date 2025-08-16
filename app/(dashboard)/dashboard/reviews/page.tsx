import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/ssr"
import { getUserRole } from "@/lib/auth/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  patient_name: string
  therapist_name: string
  booking_id: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

export default async function ReviewsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const role = await getUserRole(supabase, user.id)

  // Get reviews based on user role
  let query = supabase
    .from("reviews")
    .select(`
      id, rating, comment, created_at,
      patient_id, therapist_id,
      booking_id
    `)
    .order("created_at", { ascending: false })

  if (role === "patient") {
    query = query.eq("patient_id", user.id)
  } else if (role === "therapist") {
    query = query.eq("therapist_id", user.id)
  }

  const { data: reviewsData } = await query

  // Get user names for reviews
  const reviews: Review[] = []
  if (reviewsData) {
    for (const review of reviewsData) {
      const [{ data: patient }, { data: therapist }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", review.patient_id).single(),
        supabase.from("profiles").select("full_name").eq("id", review.therapist_id).single(),
      ])

      reviews.push({
        ...review,
        patient_name: patient?.full_name || "Patient",
        therapist_name: therapist?.full_name || "Therapist",
      } as Review)
    }
  }

  // Calculate average rating for therapists
  let averageRating = 0
  if (role === "therapist" && reviews.length > 0) {
    averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  }

  return (
    <div className="space-y-6">
      {role === "therapist" && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div>
                <StarRating rating={Math.round(averageRating)} />
                <p className="text-sm text-muted-foreground">
                  Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {role === "patient" ? "Your Reviews" : role === "therapist" ? "Reviews About You" : "All Reviews"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        {role === "patient" ? (
                          <span>
                            <strong>Therapist:</strong> {review.therapist_name}
                          </span>
                        ) : (
                          <span>
                            <strong>Patient:</strong> {review.patient_name}
                          </span>
                        )}
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {role === "patient" ? "You haven't written any reviews yet." : "No reviews yet."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
