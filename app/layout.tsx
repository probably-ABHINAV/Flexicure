import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { ErrorBoundary } from "@/lib/monitoring/error-boundary"
import { Toaster } from "@/components/ui/toaster"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
let safeMetadataBase: URL | undefined
try {
  safeMetadataBase = new URL(appUrl)
} catch {
  safeMetadataBase = undefined
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // Only set metadataBase when a valid absolute URL is available
  ...(safeMetadataBase ? { metadataBase: safeMetadataBase } : {}),
  title: "Flexicure – Physiotherapy & Remote Care Platform",
  description: "A modern, secure, mobile-first physiotherapy platform for patients, therapists, and admins.",
  keywords: ["physiotherapy", "remote care", "telehealth", "rehabilitation", "healthcare"],
  authors: [{ name: "Flexicure Team" }],
  creator: "Flexicure",
  publisher: "Flexicure",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "Flexicure",
    title: "Flexicure – Physiotherapy & Remote Care Platform",
    description: "A modern, secure, mobile-first physiotherapy platform for patients, therapists, and admins.",
    images: [
      {
        url: "/flexicure-physiotherapy-platform-preview.png",
        width: 1200,
        height: 630,
        alt: "Flexicure Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flexicure – Physiotherapy & Remote Care Platform",
    description: "A modern, secure, mobile-first physiotherapy platform for patients, therapists, and admins.",
    images: ["/flexicure-physiotherapy-platform-preview.png"],
    creator: "@flexicure",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: appUrl,
  },
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Security headers via meta tags (backup to middleware) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#16a34a" />
        <meta name="msapplication-TileColor" content="#16a34a" />

        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preload" href="/images/flexicure-logo.png" as="image" />

        {/* Critical CSS inlining hint */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .hero-gradient { background: linear-gradient(135deg, #f0fdf4 0%, #dbeafe 50%, #faf5ff 100%); }
            .text-gradient { background: linear-gradient(135deg, #16a34a 0%, #2563eb 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
          `,
          }}
        />
      </head>
      <body className={inter.className}>
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
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="min-h-svh flex flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <footer className="border-t">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p>
                      {"© "}
                      {new Date().getFullYear()} Flexicure. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                      <a href="/privacy" className="hover:underline">
                        Privacy Policy
                      </a>
                      <a href="/terms" className="hover:underline">
                        Terms of Service
                      </a>
                      <a href="/status" className="hover:underline">
                        Status
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
