"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Pause, Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"

interface VideoTestimonial {
  id: string
  name: string
  age: number
  condition: string
  location: string
  avatar: string
  videoThumbnail: string
  videoUrl: string
  quote: string
  rating: number
  duration: string
  therapist: string
  recoveryTime: string
}

const testimonials: VideoTestimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    age: 34,
    condition: "Lower Back Pain",
    location: "New York, USA",
    avatar: "/diverse-woman-smiling.png",
    videoThumbnail: "/placeholder.svg?height=300&width=400&text=Sarah's+Story",
    videoUrl: "/placeholder-video.mp4",
    quote: "Flexicure changed my life. I went from chronic pain to running marathons again!",
    rating: 5,
    duration: "2:34",
    therapist: "Dr. Emily Chen",
    recoveryTime: "8 weeks",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    age: 28,
    condition: "Shoulder Injury",
    location: "Los Angeles, USA",
    avatar: "/professional-man.png",
    videoThumbnail: "/placeholder.svg?height=300&width=400&text=Michael's+Journey",
    videoUrl: "/placeholder-video.mp4",
    quote: "The convenience and quality of care exceeded all my expectations.",
    rating: 5,
    duration: "3:12",
    therapist: "Dr. Sarah Williams",
    recoveryTime: "6 weeks",
  },
  {
    id: "3",
    name: "Lisa Park",
    age: 42,
    condition: "Knee Rehabilitation",
    location: "Chicago, USA",
    avatar: "/woman-teacher-classroom.png",
    videoThumbnail: "/placeholder.svg?height=300&width=400&text=Lisa's+Recovery",
    videoUrl: "/placeholder-video.mp4",
    quote: "Professional, caring, and incredibly effective. Highly recommend!",
    rating: 5,
    duration: "2:56",
    therapist: "Dr. James Thompson",
    recoveryTime: "10 weeks",
  },
  {
    id: "4",
    name: "David Kim",
    age: 55,
    condition: "Post-Surgery Recovery",
    location: "Seattle, USA",
    avatar: "/older-man-contemplative.png",
    videoThumbnail: "/placeholder.svg?height=300&width=400&text=David's+Comeback",
    videoUrl: "/placeholder-video.mp4",
    quote: "The personalized care plan helped me recover faster than expected.",
    rating: 5,
    duration: "4:18",
    therapist: "Dr. Maria Garcia",
    recoveryTime: "12 weeks",
  },
  {
    id: "5",
    name: "Emma Thompson",
    age: 29,
    condition: "Neck Pain",
    location: "Boston, USA",
    avatar: "/young-mother-tender-moment.png",
    videoThumbnail: "/placeholder.svg?height=300&width=400&text=Emma's+Transformation",
    videoUrl: "/placeholder-video.mp4",
    quote: "As a busy mom, the flexibility of online sessions was perfect for me.",
    rating: 5,
    duration: "3:45",
    therapist: "Dr. Emily Chen",
    recoveryTime: "5 weeks",
  },
]

export function VideoTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setPlayingVideo(null)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setPlayingVideo(null)
  }

  const handleVideoPlay = (id: string) => {
    setPlayingVideo(playingVideo === id ? null : id)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Patient Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Real Stories, Real Results
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Hear directly from our patients about their transformative recovery journeys with Flexicure.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Main Featured Testimonial */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Card className="overflow-hidden shadow-2xl border-0">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Video Section */}
                <div className="relative bg-gray-900 aspect-video lg:aspect-auto">
                  <img
                    src={currentTestimonial.videoThumbnail || "/placeholder.svg"}
                    alt={`${currentTestimonial.name}'s testimonial`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Button
                      onClick={() => handleVideoPlay(currentTestimonial.id)}
                      size="lg"
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-2 border-white rounded-full p-6"
                    >
                      {playingVideo === currentTestimonial.id ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <Play className="h-8 w-8 ml-1" />
                      )}
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                    {currentTestimonial.duration}
                  </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center mb-6">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <Quote className="h-8 w-8 text-blue-600 mb-4" />
                  <blockquote className="text-xl lg:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6 leading-relaxed">
                    "{currentTestimonial.quote}"
                  </blockquote>

                  <div className="flex items-center mb-6">
                    <Avatar className="h-16 w-16 mr-4">
                      <AvatarImage
                        src={currentTestimonial.avatar || "/placeholder.svg"}
                        alt={currentTestimonial.name}
                      />
                      <AvatarFallback>{currentTestimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-lg">{currentTestimonial.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Age {currentTestimonial.age} • {currentTestimonial.location}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">Condition:</span>
                      <p className="font-semibold">{currentTestimonial.condition}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">Recovery Time:</span>
                      <p className="font-semibold">{currentTestimonial.recoveryTime}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600 dark:text-gray-300">Therapist:</span>
                      <p className="font-semibold">{currentTestimonial.therapist}</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <Button onClick={prevTestimonial} variant="outline" size="sm" className="rounded-full p-3 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setPlayingVideo(null)
                  }}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>

            <Button onClick={nextTestimonial} variant="outline" size="sm" className="rounded-full p-3 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    index === currentIndex ? "ring-2 ring-blue-600 shadow-lg" : ""
                  }`}
                  onClick={() => {
                    setCurrentIndex(index)
                    setPlayingVideo(null)
                  }}
                >
                  <div className="relative aspect-video">
                    <img
                      src={testimonial.videoThumbnail || "/placeholder.svg"}
                      alt={`${testimonial.name}'s story`}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      {testimonial.duration}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm mb-1">{testimonial.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{testimonial.condition}</p>
                    <div className="flex items-center mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Recovery Journey?</h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Join thousands of patients who have transformed their lives with our expert physiotherapy care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
                Book Your First Session
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
