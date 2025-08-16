"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marathon Runner",
    image: "/diverse-woman-smiling.png",
    rating: 5,
    text: "After my knee injury, I thought my running days were over. The physiotherapists at Flexicure created a personalized recovery plan that got me back on track. The convenience of remote sessions meant I could stick to my treatment schedule perfectly.",
    condition: "Knee Injury Recovery",
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    image: "/professional-man.png",
    rating: 5,
    text: "Working from home gave me terrible back pain. The ergonomic assessments and exercise routines I received through video sessions were incredibly effective. I'm pain-free and more productive than ever.",
    condition: "Chronic Back Pain",
  },
  {
    name: "Emily Rodriguez",
    role: "Teacher",
    image: "/woman-teacher-classroom.png",
    rating: 5,
    text: "The shoulder rehabilitation program was exactly what I needed. My therapist was knowledgeable, patient, and always available for questions. The progress tracking helped me stay motivated throughout my recovery.",
    condition: "Shoulder Rehabilitation",
  },
  {
    name: "David Thompson",
    role: "Retired Veteran",
    image: "/older-man-contemplative.png",
    rating: 5,
    text: "As someone with mobility issues, remote physiotherapy has been a game-changer. The quality of care is exceptional, and I don't have to worry about transportation to appointments. Highly recommend!",
    condition: "Mobility Enhancement",
  },
  {
    name: "Lisa Park",
    role: "New Mother",
    image: "/young-mother-tender-moment.png",
    rating: 5,
    text: "Post-pregnancy recovery was challenging, but having access to specialized physiotherapy from home made all the difference. The flexible scheduling worked perfectly with my baby's routine.",
    condition: "Postpartum Recovery",
  },
]

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section ref={ref} className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">What Our</span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Patients Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real stories from real people who have transformed their health and recovery journey with our expert
            physiotherapy care.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 lg:p-12 relative overflow-hidden"
          >
            {/* Quote Icon */}
            <div className="absolute top-8 right-8 opacity-20">
              <Quote className="h-16 w-16 text-green-600" />
            </div>

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl lg:text-2xl text-gray-700 dark:text-gray-200 text-center mb-8 leading-relaxed font-medium">
                "{testimonials[currentIndex].text}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentIndex].image || "/placeholder.svg"}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="text-center">
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">{testimonials[currentIndex].name}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{testimonials[currentIndex].role}</p>
                  <p className="text-sm text-green-600 font-medium">{testimonials[currentIndex].condition}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full hover:bg-green-50 hover:border-green-200 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "bg-green-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full hover:bg-green-50 hover:border-green-200 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
