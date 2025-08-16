"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { UserPlus, Search, Calendar, Video } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account in under 2 minutes. Tell us about your condition and recovery goals.",
    step: "01",
  },
  {
    icon: Search,
    title: "Find Your Therapist",
    description: "Browse our network of licensed physiotherapists and find the perfect match for your needs.",
    step: "02",
  },
  {
    icon: Calendar,
    title: "Book a Session",
    description: "Schedule your first consultation at a time that works for you. Same-day appointments available.",
    step: "03",
  },
  {
    icon: Video,
    title: "Start Healing",
    description: "Join your secure video session and begin your personalized treatment plan immediately.",
    step: "04",
  },
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">How It</span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Get started with professional physiotherapy in just 4 simple steps. No complicated setup, no waiting rooms,
            just effective care.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 transform -translate-y-1/2"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="relative mb-8">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {step.step}
                  </div>

                  {/* Icon Container */}
                  <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-2xl shadow-lg flex items-center justify-center mx-auto group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <step.icon className="h-10 w-10 text-green-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{step.title}</h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
