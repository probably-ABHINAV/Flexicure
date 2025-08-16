"use client"

import { useSearchParams } from "next/navigation"
import { WaitingRoom } from "@/components/video/waiting-room"

export default function WaitingRoomPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking") || ""

  // Mock data - in real app, fetch from API
  const mockData = {
    patientName: "John Doe",
    therapistName: "Dr. Sarah Johnson",
    therapistAvatar: "/placeholder.svg?height=40&width=40",
    scheduledTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  }

  const handleJoinSession = () => {
    window.location.href = `/dashboard/video?booking=${bookingId}`
  }

  const handleCancelSession = () => {
    window.location.href = "/dashboard/bookings"
  }

  return (
    <WaitingRoom
      bookingId={bookingId}
      patientName={mockData.patientName}
      therapistName={mockData.therapistName}
      therapistAvatar={mockData.therapistAvatar}
      scheduledTime={mockData.scheduledTime}
      onJoinSession={handleJoinSession}
      onCancelSession={handleCancelSession}
    />
  )
}
