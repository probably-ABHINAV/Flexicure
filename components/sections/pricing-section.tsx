"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Check, X, Star, Zap, Shield, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  {
    name: "Basic Care",
    description: "Perfect for occasional consultations",
    price: { monthly: 49, yearly: 39 },
    billing: "per session",
    icon: Heart,
    popular: false,
    features: [
      "30-minute video consultations",
      "Basic exercise plans",
      "Email support (48h response)",
      "Session recordings",
      "Progress tracking",
    ],
    limitations: ["No emergency support", "Limited to 2 sessions/month", "No specialized programs"],
  },
  {
    name: "Premium Care",
    description: "Comprehensive care for active recovery",
    price: { monthly: 129, yearly: 103 },
    billing: "per month",
    icon: Zap,
    popular: true,
    features: [
      "Unlimited 45-minute consultations",
      "Personalized exercise programs",
      "Priority support (24h response)",
      "Session recordings & notes",
      "Advanced progress analytics",
      "Nutrition guidance",
      "Equipment recommendations",
      "Mobile app access",
    ],
    limitations: [],
  },
  {
    name: "Elite Care",
    description: "Premium care with dedicated support",
    price: { monthly: 249, yearly: 199 },
    billing: "per month",
    icon: Shield,
    popular: false,
    features: [
      "Unlimited 60-minute consultations",
      "Dedicated physiotherapist",
      "24/7 emergency support",
      "Custom recovery programs",
      "Weekly progress reviews",
      "Nutrition & mental health support",
      "Home equipment included",
      "Family member access",
      "Specialist referrals",
    ],
    limitations: [],
  },
]

const addOns = [
  {
    name: "Nutrition Consultation",
    price: 79,
    description: "Monthly nutrition planning with certified dietitian",
  },
  {
    name: "Mental Health Support",
    price: 99,
    description: "Psychological support for recovery motivation",
  },
  {
    name: "Equipment Rental",
    price: 29,
    description: "Monthly rental of physiotherapy equipment",
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="pricing" ref={ref} className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">Choose Your</span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Care Plan</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Flexible pricing options designed to fit your recovery needs and budget. All plans include our core
            physiotherapy services with varying levels of support.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? "text-green-600" : "text-gray-500"}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isYearly ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? "text-green-600" : "text-gray-500"}`}>
              Yearly
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                Save 20%
              </Badge>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card
                  className={`h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                    plan.popular
                      ? "border-green-500 shadow-lg ring-2 ring-green-500 ring-opacity-20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-600 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-full w-fit">
                      <Icon className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${isYearly ? plan.price.yearly : plan.price.monthly}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 ml-2">/{plan.billing}</span>
                      </div>
                      {isYearly && plan.billing === "per month" && (
                        <p className="text-sm text-green-600 mt-1">
                          Save ${(plan.price.monthly - plan.price.yearly) * 12}/year
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation) => (
                            <li key={limitation} className="flex items-start">
                              <X className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-500 dark:text-gray-400">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      }`}
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Add-ons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Optional Add-ons</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {addOns.map((addon, index) => (
              <motion.div
                key={addon.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <h4 className="font-semibold text-lg mb-2">{addon.name}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{addon.description}</p>
                    <div className="text-2xl font-bold text-green-600">${addon.price}/month</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
