"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react"

declare global {
  interface Window {
    DailyIframe: any
  }
}

type CallState = "idle" | "creating" | "joining" | "in-call" | "ended" | "error"

export default function VideoPage() {
  const search = useSearchParams()
  const bookingId = search.get("booking")
  const supabase = getSupabaseBrowserClient()

  const [callState, setCallState] = React.useState<CallState>("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [roomUrl, setRoomUrl] = React.useState<string | null>(null)
  const [callFrame, setCallFrame] = React.useState<any>(null)
  const [participants, setParticipants] = React.useState<number>(0)
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true)

  const callContainerRef = React.useRef<HTMLDivElement>(null)

  // Load Daily.co SDK
  React.useEffect(() => {
    if (typeof window !== "undefined" && !window.DailyIframe) {
      const script = document.createElement("script")
      script.src = "https://unpkg.com/@daily-co/daily-js"
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  async function createRoom() {
    if (!bookingId) return
    setError(null)
    setCallState("creating")

    try {
      const res = await fetch("/api/video/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Failed to create room")
        setCallState("error")
        return
      }
      setRoomUrl(data.url)
      setCallState("idle")
    } catch (e: any) {
      setError(e?.message || "Failed to create room")
      setCallState("error")
    }
  }

  async function joinCall() {
    if (!bookingId || !roomUrl) return
    setError(null)
    setCallState("joining")

    try {
      // Get join token
      const tokenRes = await fetch("/api/video/join-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const tokenData = await tokenRes.json()
      if (!tokenRes.ok) {
        setError(tokenData?.error || "Failed to get join token")
        setCallState("error")
        return
      }

      // Wait for Daily SDK to load
      let attempts = 0
      while (!window.DailyIframe && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts++
      }

      if (!window.DailyIframe) {
        setError("Failed to load video SDK")
        setCallState("error")
        return
      }

      // Create call frame
      const frame = window.DailyIframe.createFrame(callContainerRef.current, {
        iframeStyle: {
          width: "100%",
          height: "500px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      })

      // Set up event listeners
      frame
        .on("joined-meeting", () => {
          setCallState("in-call")
          setParticipants(Object.keys(frame.participants()).length)
        })
        .on("participant-joined", () => {
          setParticipants(Object.keys(frame.participants()).length)
        })
        .on("participant-left", () => {
          setParticipants(Object.keys(frame.participants()).length)
        })
        .on("left-meeting", () => {
          setCallState("ended")
          setParticipants(0)
        })
        .on("error", (e: any) => {
          setError(e?.errorMsg || "Call error")
          setCallState("error")
        })

      setCallFrame(frame)

      // Join with token
      await frame.join({
        url: roomUrl,
        token: tokenData.token,
      })
    } catch (e: any) {
      setError(e?.message || "Failed to join call")
      setCallState("error")
    }
  }

  function leaveCall() {
    if (callFrame) {
      callFrame.leave()
      callFrame.destroy()
      setCallFrame(null)
    }
    setCallState("ended")
  }

  function toggleVideo() {
    if (callFrame) {
      const newState = !isVideoEnabled
      callFrame.setLocalVideo(newState)
      setIsVideoEnabled(newState)
    }
  }

  function toggleAudio() {
    if (callFrame) {
      const newState = !isAudioEnabled
      callFrame.setLocalAudio(newState)
      setIsAudioEnabled(newState)
    }
  }

  // Check if booking exists and get room URL
  React.useEffect(() => {
    if (!bookingId) return
    let mounted = true
    ;(async () => {
      const { data } = await supabase.from("bookings").select("daily_room_url").eq("id", bookingId).single()
      if (!mounted) return
      if (data?.daily_room_url) {
        setRoomUrl(data.daily_room_url)
      }
    })()
    return () => {
      mounted = false
    }
  }, [bookingId, supabase])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (callFrame) {
        callFrame.destroy()
      }
    }
  }, [callFrame])

  if (!bookingId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Session</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No booking ID provided.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Session</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {callState === "idle" && !roomUrl && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Create a video room for this session.</p>
              <Button onClick={createRoom} disabled={callState === "creating"}>
                {callState === "creating" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Room
              </Button>
            </div>
          )}

          {callState === "idle" && roomUrl && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Room is ready. Click to join the video session.</p>
              <Button onClick={joinCall}>
                <Video className="mr-2 h-4 w-4" />
                Join Session
              </Button>
            </div>
          )}

          {callState === "joining" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining session...
            </div>
          )}

          {callState === "ended" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Session ended.</p>
              <Button onClick={joinCall} variant="outline">
                Rejoin Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video call container */}
      <div ref={callContainerRef} className="w-full" />

      {/* Call controls */}
      {callState === "in-call" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {participants} participant{participants !== 1 ? "s" : ""} in call
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleVideo}>
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={toggleAudio}>
                  {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" size="sm" onClick={leaveCall}>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Leave
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
