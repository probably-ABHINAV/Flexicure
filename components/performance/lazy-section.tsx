"use client"

import type React from "react"

import { Suspense } from "react"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface LazySectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  className?: string
}

export function LazySection({
  children,
  fallback = <SectionSkeleton />,
  threshold = 0.1,
  className = "",
}: LazySectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: `-${Math.round((1 - threshold) * 100)}px`,
  })

  return (
    <div ref={ref} className={className}>
      {isInView ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div className="py-24 animate-pulse">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto mb-6"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Higher-order component for lazy loading sections
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  options?: { threshold?: number; fallback?: React.ReactNode },
) {
  return function LazyComponent(props: P) {
    return (
      <LazySection threshold={options?.threshold} fallback={options?.fallback}>
        <Component {...props} />
      </LazySection>
    )
  }
}
