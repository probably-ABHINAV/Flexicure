import { createServerClient } from "@/lib/supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock } from "lucide-react"

type TherapistWithRating = {
  id: string
  full_name: string
  specialties: string[] | null
  experience_years: number | null
  photo_url: string | null
  average_rating: number
  review_count: number
}

function StarRating({ rating, showNumber = true }: { rating: number; showNumber?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
      {showNumber && <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>}
    </div>
  )
}

export default async function TherapistsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  // Get approved therapists with their ratings
  const { data: therapists } = await supabase
    .from("therapists_view")
    .select("id, full_name, specialties, photo_url")
    .eq("status", "approved")
    .order("full_name")

  // Get additional therapist details and ratings
  const therapistsWithRatings: TherapistWithRating[] = []

  if (therapists) {
    for (const therapist of therapists) {
      // Get therapist details
      const { data: details } = await supabase
        .from("therapists")
        .select("experience_years")
        .eq("id", therapist.id)
        .single()

      // Get average rating and review count
      const { data: ratingData } = await supabase.from("reviews").select("rating").eq("therapist_id", therapist.id)

      const ratings = ratingData || []
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0

      therapistsWithRatings.push({
        ...therapist,
        experience_years: details?.experience_years || null,
        average_rating: averageRating,
        review_count: ratings.length,
      })
    }
  }

  // Sort by rating (highest first), then by name
  therapistsWithRatings.sort((a, b) => {
    if (b.average_rating !== a.average_rating) {
      return b.average_rating - a.average_rating
    }
    return a.full_name.localeCompare(b.full_name)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find a Therapist</CardTitle>
      </CardHeader>
      <CardContent>
        {therapistsWithRatings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {therapistsWithRatings.map((therapist) => (
              <Card key={therapist.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {therapist.photo_url ? (
                        <img
                          src={therapist.photo_url || "/placeholder.svg"}
                          alt={therapist.full_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {therapist.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{therapist.full_name}</h3>
                        {therapist.experience_years && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {therapist.experience_years} years experience
                          </div>
                        )}
                      </div>
                    </div>

                    {therapist.review_count > 0 ? (
                      <StarRating rating={therapist.average_rating} />
                    ) : (
                      <p className="text-sm text-muted-foreground">No reviews yet</p>
                    )}

                    {therapist.specialties && therapist.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {therapist.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {therapist.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{therapist.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button asChild className="w-full" size="sm">
                      <Link href={`/dashboard/bookings/new?therapist=${therapist.id}`}>Book Session</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No therapists available at the moment.</p>
        )}
      </CardContent>
    </Card>
  )
}
