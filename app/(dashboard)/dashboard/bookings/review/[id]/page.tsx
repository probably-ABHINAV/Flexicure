"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Star, Loader2 } from "lucide-react"

type Booking = {
  id: string
  patient_id: string
  therapist_id: string
  therapist_name: string
  start_time: string
  status: string
}

export default function ReviewBookingPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const [booking, setBooking] = React.useState<Booking | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [rating, setRating] = React.useState<number>(0)
  const [hoverRating, setHoverRating] = React.useState<number>(0)
  const [comment, setComment] = React.useState("")
  const [existingReview, setExistingReview] = React.useState<any>(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      // Get booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings_view")
        .select("id, patient_id, therapist_id, therapist_name, start_time, status")
        .eq("id", params.id)
        .single()

      if (!mounted) return

      if (bookingError || !bookingData) {
        setError("Booking not found or access denied")
        setLoading(false)
        return
      }

      // Check if user is the patient for this booking
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || bookingData.patient_id !== user.id) {
        setError("Only patients can review their sessions")
        setLoading(false)
        return
      }

      // Check if session is completed
      if (bookingData.status !== "completed") {
        setError("You can only review completed sessions")
        setLoading(false)
        return
      }

      setBooking(bookingData as Booking)

      // Check for existing review
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("id, rating, comment")
        .eq("booking_id", params.id)
        .maybeSingle()

      if (reviewData) {
        setExistingReview(reviewData)
        setRating(reviewData.rating)
        setComment(reviewData.comment || "")
      }

      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [params.id, supabase])

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!booking || rating === 0) return

    setError(null)
    setSubmitting(true)

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({ rating, comment: comment.trim() || null })
          .eq("id", existingReview.id)

        if (error) throw error
      } else {
        // Create new review
        const { error } = await supabase.from("reviews").insert({
          booking_id: booking.id,
          patient_id: booking.patient_id,
          therapist_id: booking.therapist_id,
          rating,
          comment: comment.trim() || null,
        })

        if (error) throw error
      }

      router.push("/dashboard/bookings")
    } catch (e: any) {
      setError(e?.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingReview ? "Update Review" : "Review Session"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Therapist:</span>
              <span>{booking?.therapist_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Date:</span>
              <span>{booking?.start_time ? new Date(booking.start_time).toLocaleDateString() : "-"}</span>
            </div>
          </div>

          <form onSubmit={submitReview} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this therapist..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={rating === 0 || submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {existingReview ? "Update Review" : "Submit Review"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
