import { Suspense } from "react"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { VideoTestimonialsSection } from "@/components/sections/video-testimonials-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { StatsSection } from "@/components/sections/stats-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { FAQSection } from "@/components/sections/faq-section"
import { ContactSection } from "@/components/sections/contact-section"
import { CTASection } from "@/components/sections/cta-section"
import { LiveChatWidget } from "@/components/chat/live-chat-widget"
import { ABTestProvider } from "@/lib/ab-testing/ab-test-provider"

// A/B Test configurations
const abTests = [
  {
    id: "hero-cta",
    variants: [
      { id: "control", name: "Get Started Today" },
      { id: "variant-a", name: "Start Your Recovery" },
      { id: "variant-b", name: "Book Free Consultation" },
    ],
    weights: [0.4, 0.3, 0.3],
  },
  {
    id: "pricing-highlight",
    variants: [
      { id: "control", name: "Standard Highlight" },
      { id: "variant-a", name: "Popular Badge" },
      { id: "variant-b", name: "Best Value Badge" },
    ],
    weights: [0.5, 0.25, 0.25],
  },
]

function LoadingSection() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ABTestProvider tests={abTests}>
      <div className="min-h-screen">
        <Suspense fallback={<LoadingSection />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-gray-50 dark:bg-gray-800 animate-pulse" />}>
          <FeaturesSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-white dark:bg-gray-900 animate-pulse" />}>
          <HowItWorksSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-gray-50 dark:bg-gray-800 animate-pulse" />}>
          <VideoTestimonialsSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-white dark:bg-gray-900 animate-pulse" />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-gray-50 dark:bg-gray-800 animate-pulse" />}>
          <StatsSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-white dark:bg-gray-900 animate-pulse" />}>
          <PricingSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-gray-50 dark:bg-gray-800 animate-pulse" />}>
          <FAQSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-white dark:bg-gray-900 animate-pulse" />}>
          <ContactSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-blue-600 animate-pulse" />}>
          <CTASection />
        </Suspense>

        {/* Live Chat Widget */}
        <LiveChatWidget />

        {/* Initialize Web Vitals Monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                import('/lib/performance/web-vitals').then(({ WebVitalsMonitor }) => {
                  WebVitalsMonitor.getInstance();
                });
              }
            `,
          }}
        />
      </div>
    </ABTestProvider>
  )
}
