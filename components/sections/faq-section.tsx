"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ChevronDown, HelpCircle, Shield, CreditCard, Video, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const faqCategories = [
  {
    id: "general",
    name: "General",
    icon: HelpCircle,
    questions: [
      {
        question: "What is Flexicure and how does it work?",
        answer:
          "Flexicure is a comprehensive remote physiotherapy platform that connects patients with licensed physiotherapists through secure video consultations. Our platform provides personalized treatment plans, exercise programs, and ongoing support to help you recover from injuries or manage chronic conditions from the comfort of your home.",
      },
      {
        question: "Do I need special equipment for remote physiotherapy?",
        answer:
          "Most sessions require only basic items you likely have at home, such as towels, water bottles, or resistance bands. For specialized treatments, we provide equipment recommendations and offer rental options through our Elite Care plan. Your physiotherapist will assess your needs during the initial consultation.",
      },
      {
        question: "How do I know if remote physiotherapy is right for me?",
        answer:
          "Remote physiotherapy is effective for many conditions including back pain, joint issues, post-surgical recovery, and chronic pain management. During your initial consultation, our physiotherapists will assess your condition and determine if remote care is appropriate or if in-person treatment is recommended.",
      },
    ],
  },
  {
    id: "security",
    name: "Security & Privacy",
    icon: Shield,
    questions: [
      {
        question: "Is my personal health information secure?",
        answer:
          "Yes, absolutely. Flexicure is fully HIPAA compliant and uses enterprise-grade encryption to protect all your personal health information. Our platform undergoes regular security audits and we never share your data with third parties without your explicit consent.",
      },
      {
        question: "Are video sessions recorded?",
        answer:
          "Sessions are only recorded with your explicit consent and for your benefit. Recordings are stored securely and can be accessed through your patient portal for reference. You can opt out of recording at any time, and all recordings are automatically deleted after 90 days unless you choose to keep them longer.",
      },
    ],
  },
  {
    id: "billing",
    name: "Billing & Plans",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and HSA/FSA cards. For monthly plans, payments are automatically processed on your billing date. You can update your payment method anytime in your account settings.",
      },
      {
        question: "Can I change or cancel my plan anytime?",
        answer:
          "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect at your next billing cycle. If you cancel, you'll continue to have access to your current plan until the end of your billing period. No cancellation fees apply.",
      },
      {
        question: "Do you accept insurance?",
        answer:
          "We're working with major insurance providers to offer coverage. Currently, we provide detailed receipts that you can submit to your insurance for potential reimbursement. Many HSA and FSA accounts cover our services. Contact your insurance provider to verify coverage.",
      },
    ],
  },
  {
    id: "sessions",
    name: "Sessions & Treatment",
    icon: Video,
    questions: [
      {
        question: "How long are physiotherapy sessions?",
        answer:
          "Session lengths vary by plan: Basic Care includes 30-minute sessions, Premium Care offers 45-minute sessions, and Elite Care provides 60-minute sessions. Your physiotherapist may recommend longer sessions based on your specific needs and treatment plan.",
      },
      {
        question: "What happens during my first session?",
        answer:
          "Your first session includes a comprehensive assessment where your physiotherapist will review your medical history, discuss your symptoms and goals, and perform a virtual physical examination. Based on this assessment, they'll create a personalized treatment plan and may assign initial exercises.",
      },
      {
        question: "Can I reschedule or cancel appointments?",
        answer:
          "Yes, you can reschedule or cancel appointments up to 24 hours in advance through your patient portal or mobile app. Late cancellations (less than 24 hours) may result in a charge depending on your plan. Emergency cancellations are handled case-by-case.",
      },
    ],
  },
  {
    id: "support",
    name: "Support",
    icon: Headphones,
    questions: [
      {
        question: "What if I have technical issues during a session?",
        answer:
          "Our technical support team is available during all session hours to help resolve any issues quickly. You can contact support via live chat, phone, or email. We also provide pre-session technical checks and troubleshooting guides in your patient portal.",
      },
      {
        question: "How quickly can I get support if I have questions?",
        answer:
          "Support response times vary by plan: Basic Care receives email support with 48-hour response, Premium Care gets priority support with 24-hour response, and Elite Care includes 24/7 emergency support with immediate response for urgent matters.",
      },
    ],
  },
]

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("general")
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const activeQuestions = faqCategories.find((cat) => cat.id === activeCategory)?.questions || []

  return (
    <section id="faq" ref={ref} className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">Frequently Asked</span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about our remote physiotherapy services, billing, and platform features.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {faqCategories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => {
                    setActiveCategory(category.id)
                    setOpenQuestion(null)
                  }}
                  className={`flex items-center space-x-2 ${
                    activeCategory === category.id
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-transparent hover:bg-green-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </Button>
              )
            })}
          </motion.div>

          {/* Questions */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {activeQuestions.map((faq, index) => {
              const isOpen = openQuestion === `${activeCategory}-${index}`
              return (
                <motion.div
                  key={`${activeCategory}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <button
                      onClick={() => setOpenQuestion(isOpen ? null : `${activeCategory}-${index}`)}
                      className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="px-6 pb-6 pt-0">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Still have questions?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Our support team is here to help you with any additional questions or concerns.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">Contact Support</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
