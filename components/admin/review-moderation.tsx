"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Flag, Check, X, Eye, MessageSquare, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: string
  patientName: string
  patientAvatar?: string
  therapistName: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected" | "flagged"
  createdAt: Date
  updatedAt: Date
  flagReason?: string
  moderatorNotes?: string
  bookingId: string
  reportCount: number
}

const mockReviews: Review[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    therapistName: "Dr. Emily Chen",
    rating: 5,
    comment:
      "Absolutely amazing experience! Dr. Chen was incredibly professional and helped me recover from my shoulder injury much faster than expected. The remote sessions were convenient and effective.",
    status: "approved",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    bookingId: "booking-1",
    reportCount: 0,
  },
  {
    id: "2",
    patientName: "Michael Rodriguez",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    therapistName: "Dr. Sarah Williams",
    rating: 1,
    comment:
      "This is completely inappropriate content that violates our community guidelines. The service was terrible and unprofessional.",
    status: "flagged",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
    flagReason: "Inappropriate content",
    bookingId: "booking-2",
    reportCount: 3,
  },
  {
    id: "3",
    patientName: "Lisa Park",
    therapistName: "Dr. James Thompson",
    rating: 4,
    comment:
      "Good service overall. The therapist was knowledgeable and the platform was easy to use. Would recommend to others.",
    status: "pending",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
    bookingId: "booking-3",
    reportCount: 0,
  },
  {
    id: "4",
    patientName: "David Kim",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    therapistName: "Dr. Maria Garcia",
    rating: 5,
    comment:
      "Outstanding care! Dr. Garcia helped me with my back pain and provided excellent exercise recommendations.",
    status: "approved",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    bookingId: "booking-4",
    reportCount: 0,
  },
]

export function ReviewModeration() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [moderatorNotes, setModeratorNotes] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const { toast } = useToast()

  const filteredReviews = reviews.filter((review) => filterStatus === "all" || review.status === filterStatus)

  const handleApprove = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, status: "approved" as const, updatedAt: new Date(), moderatorNotes }
          : review,
      ),
    )

    toast({
      title: "Review approved",
      description: "The review has been approved and is now visible to users.",
    })

    setSelectedReview(null)
    setModeratorNotes("")
  }

  const handleReject = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, status: "rejected" as const, updatedAt: new Date(), moderatorNotes }
          : review,
      ),
    )

    toast({
      title: "Review rejected",
      description: "The review has been rejected and will not be visible to users.",
    })

    setSelectedReview(null)
    setModeratorNotes("")
  }

  const handleFlag = async (reviewId: string, reason: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, status: "flagged" as const, flagReason: reason, updatedAt: new Date(), moderatorNotes }
          : review,
      ),
    )

    toast({
      title: "Review flagged",
      description: "The review has been flagged for further investigation.",
    })

    setSelectedReview(null)
    setModeratorNotes("")
  }

  const getStatusBadge = (status: Review["status"]) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      flagged: "destructive",
    } as const

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      flagged: "bg-orange-100 text-orange-800",
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStatusCounts = () => {
    return {
      all: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
      flagged: reviews.filter((r) => r.status === "flagged").length,
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Moderation</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage and moderate patient reviews</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews ({statusCounts.all})</SelectItem>
            <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
            <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
            <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
            <SelectItem value="flagged">Flagged ({statusCounts.flagged})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Review List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-6">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={review.patientAvatar || "/placeholder.svg"} alt={review.patientName} />
                        <AvatarFallback>{review.patientName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{review.patientName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Session with {review.therapistName}</p>
                        <p className="text-xs text-gray-500">{review.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {review.reportCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <Flag className="h-3 w-3 mr-1" />
                          {review.reportCount} reports
                        </Badge>
                      )}
                      {getStatusBadge(review.status)}
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>

                  {review.flagReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-red-800 dark:text-red-200">
                          Flagged: {review.flagReason}
                        </span>
                      </div>
                    </div>
                  )}

                  {review.moderatorNotes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Moderator Notes:</strong> {review.moderatorNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review Details
                    </Button>

                    {review.status === "pending" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(review.id)}>
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlag(review.id, "Needs investigation")}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Flag
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Reviews</p>
                    <p className="text-2xl font-bold">{statusCounts.all}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Review</p>
                    <p className="text-2xl font-bold">{statusCounts.pending}</p>
                  </div>
                  <Eye className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Flagged Reviews</p>
                    <p className="text-2xl font-bold">{statusCounts.flagged}</p>
                  </div>
                  <Flag className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Approval Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round((statusCounts.approved / statusCounts.all) * 100)}%
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Review Details</CardTitle>
              <CardDescription>
                Review from {selectedReview.patientName} for {selectedReview.therapistName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={selectedReview.patientAvatar || "/placeholder.svg"}
                    alt={selectedReview.patientName}
                  />
                  <AvatarFallback>{selectedReview.patientName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedReview.patientName}</h3>
                  <p className="text-gray-600 dark:text-gray-300">Session with {selectedReview.therapistName}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-medium">{selectedReview.rating}/5</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Review Comment</h4>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {selectedReview.comment}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Moderator Notes</h4>
                <Textarea
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReview(null)
                    setModeratorNotes("")
                  }}
                >
                  Close
                </Button>

                {selectedReview.status === "pending" && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleApprove(selectedReview.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="destructive" onClick={() => handleReject(selectedReview.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
