"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, Shield, Clock, Users, Star, Smartphone, Heart, Award, Zap, Globe, Lock } from "lucide-react"

const features = [
  {
    icon: Video,
    title: "HD Video Consultations",
    description: "Crystal clear video calls with professional therapists from the comfort of your home.",
    badge: "Popular",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book appointments that fit your schedule with 24/7 availability.",
    badge: "Convenient",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Your health data is protected with enterprise-grade security and privacy.",
    badge: "Secure",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Clock,
    title: "Quick Access",
    description: "Get connected with a therapist in minutes, not days or weeks.",
    badge: "Fast",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    icon: Users,
    title: "Expert Therapists",
    description: "Licensed physiotherapists with years of experience and proven results.",
    badge: "Certified",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    icon: Star,
    title: "Personalized Care",
    description: "Customized treatment plans tailored to your specific needs and goals.",
    badge: "Custom",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Access your therapy sessions from any device, anywhere, anytime.",
    badge: "Accessible",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    icon: Heart,
    title: "Progress Tracking",
    description: "Monitor your recovery journey with detailed progress reports and analytics.",
    badge: "Insights",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "All therapists are vetted and continuously monitored for quality care.",
    badge: "Trusted",
    color: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description: "Stay updated with appointment reminders and important health updates.",
    badge: "Smart",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Connect with therapists worldwide, breaking geographical barriers.",
    badge: "Worldwide",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description: "Your personal health information is encrypted and never shared.",
    badge: "Private",
    color: "text-slate-600",
    bgColor: "bg-slate-50 dark:bg-slate-900/20",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Everything You Need for Better Health
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features you need for effective remote physiotherapy
            treatment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-3 rounded-lg ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience the Future of Physiotherapy?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of patients who have already transformed their recovery journey with our innovative
              platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Schedule Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
