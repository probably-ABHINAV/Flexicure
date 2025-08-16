"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Pause,
  Square,
  Download,
  Share2,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  FastForward,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Recording {
  id: string
  sessionId: string
  patientName: string
  therapistName: string
  duration: number
  size: number
  createdAt: Date
  status: "processing" | "ready" | "failed"
  url?: string
  thumbnail?: string
}

interface RecordingSettings {
  quality: "720p" | "1080p" | "4K"
  includeAudio: boolean
  includeScreen: boolean
  autoStart: boolean
}

const mockRecordings: Recording[] = [
  {
    id: "1",
    sessionId: "session-1",
    patientName: "Sarah Johnson",
    therapistName: "Dr. Emily Chen",
    duration: 2340, // seconds
    size: 245000000, // bytes
    createdAt: new Date("2024-01-15T10:00:00Z"),
    status: "ready",
    url: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=180&width=320&text=Session+Recording",
  },
  {
    id: "2",
    sessionId: "session-2",
    patientName: "Michael Rodriguez",
    therapistName: "Dr. Sarah Williams",
    duration: 1800,
    size: 189000000,
    createdAt: new Date("2024-01-14T14:30:00Z"),
    status: "processing",
  },
  {
    id: "3",
    sessionId: "session-3",
    patientName: "Lisa Park",
    therapistName: "Dr. James Thompson",
    duration: 2700,
    size: 298000000,
    createdAt: new Date("2024-01-13T09:15:00Z"),
    status: "ready",
    url: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=180&width=320&text=Therapy+Session",
  },
]

export function SessionRecording() {
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [settings, setSettings] = useState<RecordingSettings>({
    quality: "1080p",
    includeAudio: true,
    includeScreen: true,
    autoStart: false,
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: settings.quality === "4K" ? 3840 : settings.quality === "1080p" ? 1920 : 1280,
          height: settings.quality === "4K" ? 2160 : settings.quality === "1080p" ? 1080 : 720,
        },
        audio: settings.includeAudio,
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      })

      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        const url = URL.createObjectURL(blob)

        const newRecording: Recording = {
          id: Date.now().toString(),
          sessionId: `session-${Date.now()}`,
          patientName: "Current Patient",
          therapistName: "Current Therapist",
          duration: recordingTime,
          size: blob.size,
          createdAt: new Date(),
          status: "ready",
          url,
        }

        setRecordings((prev) => [newRecording, ...prev])
        setRecordingTime(0)

        toast({
          title: "Recording saved",
          description: "Your session recording has been saved successfully.",
        })
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)

      toast({
        title: "Recording started",
        description: "Session recording is now active.",
      })
    } catch (error) {
      console.error("Failed to start recording:", error)
      toast({
        title: "Recording failed",
        description: "Unable to start session recording. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const playRecording = (recording: Recording) => {
    setSelectedRecording(recording)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }

  const downloadRecording = (recording: Recording) => {
    if (recording.url) {
      const a = document.createElement("a")
      a.href = recording.url
      a.download = `session-${recording.sessionId}-${recording.createdAt.toISOString().split("T")[0]}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Download started",
        description: "Your recording download has begun.",
      })
    }
  }

  const shareRecording = async (recording: Recording) => {
    if (navigator.share && recording.url) {
      try {
        await navigator.share({
          title: `Session Recording - ${recording.patientName}`,
          text: `Physiotherapy session recording from ${recording.createdAt.toLocaleDateString()}`,
          url: recording.url,
        })
      } catch (error) {
        console.error("Failed to share:", error)
      }
    } else {
      // Fallback: copy link to clipboard
      if (recording.url) {
        await navigator.clipboard.writeText(recording.url)
        toast({
          title: "Link copied",
          description: "Recording link copied to clipboard.",
        })
      }
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Recording</h1>
          <p className="text-gray-600 dark:text-gray-300">Record and manage therapy session videos</p>
        </div>
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
              <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
              Start Recording
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900 px-3 py-2 rounded-lg">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-red-800 dark:text-red-200 font-medium">{formatTime(recordingTime)}</span>
              </div>
              <Button onClick={stopRecording} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recording Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Recording Settings
          </CardTitle>
          <CardDescription>Configure recording quality and options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quality</label>
              <Select
                value={settings.quality}
                onValueChange={(value: "720p" | "1080p" | "4K") => setSettings((prev) => ({ ...prev, quality: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="4K">4K Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeAudio"
                checked={settings.includeAudio}
                onChange={(e) => setSettings((prev) => ({ ...prev, includeAudio: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="includeAudio" className="text-sm font-medium">
                Include Audio
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeScreen"
                checked={settings.includeScreen}
                onChange={(e) => setSettings((prev) => ({ ...prev, includeScreen: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="includeScreen" className="text-sm font-medium">
                Screen Recording
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoStart"
                checked={settings.autoStart}
                onChange={(e) => setSettings((prev) => ({ ...prev, autoStart: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="autoStart" className="text-sm font-medium">
                Auto-start
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Player */}
      {selectedRecording && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedRecording.patientName} - {selectedRecording.therapistName}
            </CardTitle>
            <CardDescription>Recorded on {selectedRecording.createdAt.toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  poster={selectedRecording.thumbnail}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={selectedRecording.url} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Controls */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300 w-12">{formatTime(currentTime)}</span>
                  <div className="flex-1">
                    <Progress
                      value={(currentTime / selectedRecording.duration) * 100}
                      className="cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const percent = (e.clientX - rect.left) / rect.width
                        handleSeek(selectedRecording.duration * percent)
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 w-12">
                    {formatTime(selectedRecording.duration)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={togglePlayPause}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleSeek(currentTime - 10)}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleSeek(currentTime + 10)}>
                      <FastForward className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="sm" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>

                    <Select
                      value={playbackSpeed.toString()}
                      onValueChange={(value) => changePlaybackSpeed(Number.parseFloat(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => downloadRecording(selectedRecording)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => shareRecording(selectedRecording)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (videoRef.current && videoRef.current.requestFullscreen) {
                          videoRef.current.requestFullscreen()
                        }
                      }}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recordings List */}
      <Card>
        <CardHeader>
          <CardTitle>Session Recordings</CardTitle>
          <CardDescription>Manage your recorded therapy sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={recording.thumbnail || "/placeholder.svg?height=60&width=100&text=Video"}
                      alt="Recording thumbnail"
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                      {formatTime(recording.duration)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      {recording.patientName} - {recording.therapistName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {recording.createdAt.toLocaleDateString()} • {formatFileSize(recording.size)}
                    </p>
                    <div className="flex items-center mt-1">
                      {recording.status === "ready" && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Ready
                        </Badge>
                      )}
                      {recording.status === "processing" && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Processing
                        </Badge>
                      )}
                      {recording.status === "failed" && <Badge variant="destructive">Failed</Badge>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {recording.status === "ready" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => playRecording(recording)}>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadRecording(recording)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => shareRecording(recording)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {recording.status === "processing" && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
