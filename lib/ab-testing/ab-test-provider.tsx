"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface ABTest {
  id: string
  variants: ABVariant[]
  weights?: number[]
}

interface ABVariant {
  id: string
  name: string
  component?: React.ComponentType<any>
  props?: any
}

interface ABTestContextType {
  getVariant: (testId: string) => string | null
  trackEvent: (testId: string, event: string, properties?: any) => void
  isLoading: boolean
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined)

interface ABTestProviderProps {
  children: React.ReactNode
  tests: ABTest[]
  userId?: string
}

export function ABTestProvider({ children, tests, userId }: ABTestProviderProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))

  useEffect(() => {
    const loadAssignments = () => {
      const stored = localStorage.getItem("ab-test-assignments")
      let storedAssignments: Record<string, string> = {}

      if (stored) {
        try {
          storedAssignments = JSON.parse(stored)
        } catch (error) {
          console.error("Failed to parse stored AB test assignments:", error)
        }
      }

      const newAssignments: Record<string, string> = {}

      tests.forEach((test) => {
        if (storedAssignments[test.id]) {
          newAssignments[test.id] = storedAssignments[test.id]
        } else {
          // Assign variant based on weights or equal distribution
          const weights = test.weights || test.variants.map(() => 1)
          const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
          const random = Math.random() * totalWeight

          let currentWeight = 0
          let selectedVariant = test.variants[0].id

          for (let i = 0; i < test.variants.length; i++) {
            currentWeight += weights[i]
            if (random <= currentWeight) {
              selectedVariant = test.variants[i].id
              break
            }
          }

          newAssignments[test.id] = selectedVariant
        }
      })

      setAssignments(newAssignments)
      localStorage.setItem("ab-test-assignments", JSON.stringify(newAssignments))
      setIsLoading(false)

      // Track impressions for new assignments
      Object.entries(newAssignments).forEach(([testId, variantId]) => {
        if (!storedAssignments[testId]) {
          trackEvent(testId, "impression")
        }
      })
    }

    loadAssignments()
  }, [tests])

  const getVariant = (testId: string): string | null => {
    return assignments[testId] || null
  }

  const trackEvent = async (testId: string, event: string, properties: any = {}) => {
    const variant = assignments[testId]
    if (!variant) return

    const eventData = {
      testId,
      variant,
      event,
      properties,
      userId: userId || `anonymous-${sessionId}`,
      sessionId,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
    }

    try {
      await fetch("/api/ab-testing/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })
    } catch (error) {
      console.error("Failed to track AB test event:", error)
    }
  }

  const contextValue: ABTestContextType = {
    getVariant,
    trackEvent,
    isLoading,
  }

  return <ABTestContext.Provider value={contextValue}>{children}</ABTestContext.Provider>
}

export function useABTest() {
  const context = useContext(ABTestContext)
  if (context === undefined) {
    throw new Error("useABTest must be used within an ABTestProvider")
  }
  return context
}

// Hook for specific test
export function useABTestVariant(testId: string) {
  const { getVariant, trackEvent, isLoading } = useABTest()
  const variant = getVariant(testId)

  const track = (event: string, properties?: any) => {
    trackEvent(testId, event, properties)
  }

  return {
    variant,
    track,
    isLoading,
  }
}

// Component for rendering AB test variants
interface ABTestComponentProps {
  testId: string
  variants: Record<string, React.ComponentType<any>>
  fallback?: React.ComponentType<any>
  [key: string]: any
}

export function ABTestComponent({ testId, variants, fallback: Fallback, ...props }: ABTestComponentProps) {
  const { variant, isLoading } = useABTestVariant(testId)

  if (isLoading) {
    return Fallback ? <Fallback {...props} /> : null
  }

  const VariantComponent = variant ? variants[variant] : null

  if (!VariantComponent) {
    return Fallback ? <Fallback {...props} /> : null
  }

  return <VariantComponent {...props} />
}
