"use client"

interface WebVitalsMetric {
  name: string
  value: number
  rating: "good" | "needs-improvement" | "poor"
  delta: number
  id: string
}

class WebVitalsMonitor {
  private static instance: WebVitalsMonitor
  private metrics: Map<string, WebVitalsMetric> = new Map()
  private sessionId: string

  constructor() {
    this.sessionId = Math.random().toString(36).substring(7)
    this.initializeWebVitals()
  }

  static getInstance(): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor()
    }
    return WebVitalsMonitor.instance
  }

  private async initializeWebVitals() {
    if (typeof window === "undefined") return

    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import("web-vitals")

      getCLS(this.handleMetric.bind(this))
      getFID(this.handleMetric.bind(this))
      getFCP(this.handleMetric.bind(this))
      getLCP(this.handleMetric.bind(this))
      getTTFB(this.handleMetric.bind(this))
    } catch (error) {
      console.error("Failed to load web-vitals:", error)
    }
  }

  private handleMetric(metric: WebVitalsMetric) {
    this.metrics.set(metric.name, metric)
    this.sendMetric(metric)
  }

  private async sendMetric(metric: WebVitalsMetric) {
    try {
      await fetch("/api/monitoring/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          sessionId: this.sessionId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          connectionType: (navigator as any).connection?.effectiveType,
          deviceType: this.getDeviceType(),
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Failed to send web vitals metric:", error)
    }
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet"
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent))
      return "mobile"
    return "desktop"
  }

  getMetrics(): Map<string, WebVitalsMetric> {
    return this.metrics
  }

  getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
    }

    const threshold = thresholds[name as keyof typeof thresholds]
    if (!threshold) return "good"

    if (value <= threshold.good) return "good"
    if (value <= threshold.poor) return "needs-improvement"
    return "poor"
  }
}

export { WebVitalsMonitor }
