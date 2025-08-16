"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, Users, Clock, AlertTriangle, CheckCircle, Zap } from "lucide-react"

interface WebVitalsData {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  rating: "good" | "needs-improvement" | "poor"
  timestamp: string
}

interface PerformanceMetrics {
  totalUsers: number
  avgSessionDuration: number
  bounceRate: number
  pageViews: number
  errorRate: number
  uptime: number
}

const mockWebVitalsData: WebVitalsData[] = [
  { lcp: 1200, fid: 45, cls: 0.05, fcp: 800, ttfb: 200, rating: "good", timestamp: "2024-01-01T00:00:00Z" },
  { lcp: 1350, fid: 52, cls: 0.08, fcp: 900, ttfb: 250, rating: "good", timestamp: "2024-01-02T00:00:00Z" },
  {
    lcp: 1800,
    fid: 78,
    cls: 0.12,
    fcp: 1100,
    ttfb: 300,
    rating: "needs-improvement",
    timestamp: "2024-01-03T00:00:00Z",
  },
  { lcp: 1100, fid: 38, cls: 0.04, fcp: 750, ttfb: 180, rating: "good", timestamp: "2024-01-04T00:00:00Z" },
  {
    lcp: 1450,
    fid: 65,
    cls: 0.09,
    fcp: 950,
    ttfb: 280,
    rating: "needs-improvement",
    timestamp: "2024-01-05T00:00:00Z",
  },
]

const mockPerformanceMetrics: PerformanceMetrics = {
  totalUsers: 12543,
  avgSessionDuration: 285,
  bounceRate: 23.5,
  pageViews: 45678,
  errorRate: 0.8,
  uptime: 99.9,
}

const pagePerformanceData = [
  { page: "/", lcp: 1200, fid: 45, cls: 0.05, visits: 15420 },
  { page: "/auth/sign-up", lcp: 1350, fid: 52, cls: 0.08, visits: 8930 },
  { page: "/dashboard", lcp: 1100, fid: 38, cls: 0.04, visits: 12340 },
  { page: "/pricing", lcp: 1450, fid: 65, cls: 0.09, visits: 6780 },
  { page: "/contact", lcp: 1300, fid: 48, cls: 0.06, visits: 4560 },
]

const deviceData = [
  { name: "Desktop", value: 45, color: "#16a34a" },
  { name: "Mobile", value: 35, color: "#2563eb" },
  { name: "Tablet", value: 20, color: "#dc2626" },
]

export default function PerformanceDashboard() {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("lcp")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const getVitalRating = (metric: string, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    }

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return "good"

    if (value <= threshold.good) return "good"
    if (value <= threshold.poor) return "needs-improvement"
    return "poor"
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "text-green-600"
      case "needs-improvement":
        return "text-yellow-600"
      case "poor":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getRatingBadge = (rating: string) => {
    const variants = {
      good: "default",
      "needs-improvement": "secondary",
      poor: "destructive",
    } as const

    return (
      <Badge variant={variants[rating as keyof typeof variants] || "outline"}>
        {rating === "needs-improvement" ? "Needs Improvement" : rating}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const latestVitals = mockWebVitalsData[mockWebVitalsData.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor Core Web Vitals and user experience metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Core Web Vitals Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">LCP</p>
                <p className="text-2xl font-bold">{latestVitals.lcp}ms</p>
                {getRatingBadge(getVitalRating("lcp", latestVitals.lcp))}
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">FID</p>
                <p className="text-2xl font-bold">{latestVitals.fid}ms</p>
                {getRatingBadge(getVitalRating("fid", latestVitals.fid))}
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">CLS</p>
                <p className="text-2xl font-bold">{latestVitals.cls}</p>
                {getRatingBadge(getVitalRating("cls", latestVitals.cls))}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Uptime</p>
                <p className="text-2xl font-bold">{mockPerformanceMetrics.uptime}%</p>
                <Badge variant="default">Excellent</Badge>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Error Rate</p>
                <p className="text-2xl font-bold">{mockPerformanceMetrics.errorRate}%</p>
                <Badge variant="default">Good</Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="pages">Page Performance</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals Trend</CardTitle>
              <CardDescription>Performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lcp">Largest Contentful Paint (LCP)</SelectItem>
                    <SelectItem value="fid">First Input Delay (FID)</SelectItem>
                    <SelectItem value="cls">Cumulative Layout Shift (CLS)</SelectItem>
                    <SelectItem value="fcp">First Contentful Paint (FCP)</SelectItem>
                    <SelectItem value="ttfb">Time to First Byte (TTFB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockWebVitalsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [
                      selectedMetric === "cls" ? value.toFixed(3) : `${value}ms`,
                      selectedMetric.toUpperCase(),
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ fill: "#16a34a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance Analysis</CardTitle>
              <CardDescription>Core Web Vitals by page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pagePerformanceData.map((page) => (
                  <div key={page.page} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{page.page}</h4>
                      <Badge variant="outline">{page.visits.toLocaleString()} visits</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">LCP</p>
                        <p className={`font-semibold ${getRatingColor(getVitalRating("lcp", page.lcp))}`}>
                          {page.lcp}ms
                        </p>
                        <Progress value={(2500 - page.lcp) / 25} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">FID</p>
                        <p className={`font-semibold ${getRatingColor(getVitalRating("fid", page.fid))}`}>
                          {page.fid}ms
                        </p>
                        <Progress value={100 - page.fid} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">CLS</p>
                        <p className={`font-semibold ${getRatingColor(getVitalRating("cls", page.cls))}`}>{page.cls}</p>
                        <Progress value={(0.1 - page.cls) * 1000} className="mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                    <p className="text-2xl font-bold">{mockPerformanceMetrics.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Session</p>
                    <p className="text-2xl font-bold">
                      {Math.floor(mockPerformanceMetrics.avgSessionDuration / 60)}m{" "}
                      {mockPerformanceMetrics.avgSessionDuration % 60}s
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Bounce Rate</p>
                    <p className="text-2xl font-bold">{mockPerformanceMetrics.bounceRate}%</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Page Views</p>
                    <p className="text-2xl font-bold">{mockPerformanceMetrics.pageViews.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Performance Breakdown</CardTitle>
              <CardDescription>User distribution by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {deviceData.map((device) => (
                    <div key={device.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: device.color }}></div>
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <span className="text-2xl font-bold">{device.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
