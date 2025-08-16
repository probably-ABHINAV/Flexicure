"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Phone,
  Monitor,
  Wifi,
  Volume2,
  Camera,
  Headphones,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SystemCheck {
  name: string
  status: "checking" | "passed" | "failed" | "warning"
  message: string
  icon: React.ElementType
}

interface WaitingRoomProps {
  bookingId: string
  patientName: string
  therapistName: string
  therapistAvatar?: string
  sessionTime: Date
  onJoinSession: () => void
}

export function WaitingRoom({
  bookingId,
  patientName,
  therapistName,
  therapistAvatar,
  sessionTime,
  onJoinSession,
}: WaitingRoomProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([])
  const [timeUntilSession, setTimeUntilSession] = useState<string>("")
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "fair" | "poor">("good")
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("")
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("")
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[]
    microphones: MediaDeviceInfo[]
    speakers: MediaDeviceInfo[]
  }>({ cameras: [], microphones: [], speakers: [] })

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    initializeDevices()
    runSystemChecks()
    startCountdown()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (isVideoEnabled) {
      startVideoPreview()
    } else {
      stopVideoPreview()
    }
  }, [isVideoEnabled, selectedCamera])

  const initializeDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()

      setDevices({
        cameras: devices.filter((device) => device.kind === "videoinput"),
        microphones: devices.filter((device) => device.kind === "audioinput"),
        speakers: devices.filter((device) => device.kind === "audiooutput"),
      })

      // Set default devices
      const defaultCamera = devices.find((device) => device.kind === "videoinput")
      const defaultMicrophone = devices.find((device) => device.kind === "audioinput")
      const defaultSpeaker = devices.find((device) => device.kind === "audiooutput")

      if (defaultCamera) setSelectedCamera(defaultCamera.deviceId)
      if (defaultMicrophone) setSelectedMicrophone(defaultMicrophone.deviceId)
      if (defaultSpeaker) setSelectedSpeaker(defaultSpeaker.deviceId)
    } catch (error) {
      console.error("Failed to enumerate devices:", error)
    }
  }

  const startVideoPreview = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: selectedCamera ? { deviceId: selectedCamera } : true,
        audio: false, // Audio preview not needed
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Failed to start video preview:", error)
      setIsVideoEnabled(false)
    }
  }

  const stopVideoPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const runSystemChecks = async () => {
    const checks: SystemCheck[] = [
      {
        name: "Camera Access",
        status: "checking",
        message: "Checking camera permissions...",
        icon: Camera,
      },
      {
        name: "Microphone Access",
        status: "checking",
        message: "Checking microphone permissions...",
        icon: Mic,
      },
      {
        name: "Internet Connection",
        status: "checking",
        message: "Testing connection speed...",
        icon: Wifi,
      },
      {
        name: "Browser Compatibility",
        status: "checking",
        message: "Verifying browser support...",
        icon: Monitor,
      },
      {
        name: "Audio Output",
        status: "checking",
        message: "Testing speaker functionality...",
        icon: Volume2,
      },
    ]

    setSystemChecks(checks)

    // Simulate system checks with delays
    for (let i = 0; i < checks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSystemChecks((prev) =>
        prev.map((check, index) => {
          if (index === i) {
            // Simulate different outcomes
            const outcomes = ["passed", "passed", "passed", "warning", "passed"]
            const messages = [
              "Camera access granted",
              "Microphone access granted",
              "Connection speed: 25 Mbps",
              "Browser version could be updated",
              "Audio output working",
            ]

            return {
              ...check,
              status: outcomes[i] as any,
              message: messages[i],
            }
          }
          return check
        }),
      )
    }
  }

  const startCountdown = () => {
    const updateCountdown = () => {
      const now = new Date()
      const timeDiff = sessionTime.getTime() - now.getTime()

      if (timeDiff <= 0) {
        setTimeUntilSession("Session is ready to start!")
        return
      }

      const minutes = Math.floor(timeDiff / (1000 * 60))
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

      setTimeUntilSession(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }

  const getStatusIcon = (status: SystemCheck["status"]) => {
    switch (status) {
      case "checking":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "fair":
        return "text-yellow-600"
      case "poor":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const allChecksPassed = systemChecks.every((check) => check.status === "passed" || check.status === "warning")

  const canJoinSession = allChecksPassed && timeUntilSession === "Session is ready to start!"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Virtual Waiting Room
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Preparing for your session with {therapistName}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Camera Preview
                </CardTitle>
                <CardDescription>Check your camera and audio before joining the session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
                  {isVideoEnabled ? (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Camera is disabled</p>
                      </div>
                    </div>
                  )}

                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <Button
                      variant={isVideoEnabled ? "default" : "destructive"}
                      size="sm"
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      className="rounded-full"
                    >
                      {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant={isAudioEnabled ? "default" : "destructive"}
                      size="sm"
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      className="rounded-full"
                    >
                      {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Device Settings */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Camera</label>
                    <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.cameras.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Microphone</label>
                    <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.microphones.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Speaker</label>
                    <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select speaker" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.speakers.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Check
                </CardTitle>
                <CardDescription>Ensuring optimal session quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <check.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-gray-600">{check.message}</p>
                        </div>
                      </div>
                      {getStatusIcon(check.status)}
                    </div>
                  ))}
                </div>

                {allChecksPassed && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 dark:text-green-200 font-medium">All systems ready!</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Info */}
          <div className="space-y-6">
            {/* Countdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Session Countdown
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold mb-2 text-blue-600">{timeUntilSession}</div>
                <p className="text-gray-600 dark:text-gray-300">{sessionTime.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Therapist Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Your Therapist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={therapistAvatar || "/placeholder.svg"} alt={therapistName} />
                    <AvatarFallback>{therapistName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{therapistName}</h3>
                    <p className="text-gray-600 dark:text-gray-300">Licensed Physiotherapist</p>
                    <Badge variant="outline" className="mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Quality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  Connection Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Network Status</span>
                  <span className={`text-sm font-medium ${getConnectionQualityColor()}`}>
                    {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
                  </span>
                </div>
                <Progress
                  value={
                    connectionQuality === "excellent"
                      ? 100
                      : connectionQuality === "good"
                        ? 75
                        : connectionQuality === "fair"
                          ? 50
                          : 25
                  }
                  className="mb-2"
                />
                <p className="text-xs text-gray-600 dark:text-gray-300">Your connection is stable for HD video calls</p>
              </CardContent>
            </Card>

            {/* Join Session Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={onJoinSession}
                  disabled={!canJoinSession}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  size="lg"
                >
                  {canJoinSession ? (
                    <>
                      <Phone className="h-5 w-5 mr-2" />
                      Join Session
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 mr-2" />
                      Waiting to Join
                    </>
                  )}
                </Button>

                {!canJoinSession && (
                  <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Complete system checks and wait for session time
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Headphones className="h-4 w-4 mr-2" />
                    Test Audio
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Technical Support
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Therapist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
