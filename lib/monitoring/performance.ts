"use client"

import React from "react"

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure function execution time
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start

    this.recordMetric(name, duration)
    return result
  }

  // Measure async function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start

    this.recordMetric(name, duration)
    return result
  }

  // Record a metric
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const values = this.metrics.get(name)!
    values.push(value)

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  // Get metric statistics
  getMetricStats(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }

  // Send metrics to monitoring service
  async sendMetrics() {
    const allStats: Record<string, any> = {}

    for (const [name, _] of this.metrics) {
      allStats[name] = this.getMetricStats(name)
    }

    try {
      await fetch("/api/monitoring/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          metrics: allStats,
        }),
      })
    } catch (error) {
      console.error("Failed to send metrics:", error)
    }
  }

  // Monitor Core Web Vitals
  monitorWebVitals() {
    if (typeof window === "undefined") return

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric("lcp", lastEntry.startTime)
    }).observe({ entryTypes: ["largest-contentful-paint"] })

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.recordMetric("fid", entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ["first-input"] })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.recordMetric("cls", clsValue)
    }).observe({ entryTypes: ["layout-shift"] })
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()

  React.useEffect(() => {
    monitor.monitorWebVitals()

    // Send metrics every 30 seconds
    const interval = setInterval(() => {
      monitor.sendMetrics()
    }, 30000)

    return () => clearInterval(interval)
  }, [monitor])

  return {
    measure: monitor.measure.bind(monitor),
    measureAsync: monitor.measureAsync.bind(monitor),
    recordMetric: monitor.recordMetric.bind(monitor),
  }
}
