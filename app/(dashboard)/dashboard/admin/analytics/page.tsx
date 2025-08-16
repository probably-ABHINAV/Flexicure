"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Clock, Star, Video, Download } from "lucide-react"

// Mock data for analytics
const revenueData = [
  { month: "Jan", revenue: 45000, bookings: 180, patients: 150 },
  { month: "Feb", revenue: 52000, bookings: 210, patients: 175 },
  { month: "Mar", revenue: 48000, bookings: 195, patients: 160 },
  { month: "Apr", revenue: 61000, bookings: 245, patients: 200 },
  { month: "May", revenue: 58000, bookings: 230, patients: 190 },
  { month: "Jun", revenue: 67000, bookings: 270, patients: 220 },
]

const userGrowthData = [
  { month: "Jan", newUsers: 45, activeUsers: 320, retention: 85 },
  { month: "Feb", newUsers: 52, activeUsers: 365, retention: 87 },
  { month: "Mar", newUsers: 48, activeUsers: 398, retention: 84 },
  { month: "Apr", newUsers: 61, activeUsers: 445, retention: 89 },
  { month: "May", newUsers: 58, activeUsers: 485, retention: 86 },
  { month: "Jun", newUsers: 67, activeUsers: 532, retention: 91 },
]

const sessionData = [
  { day: "Mon", sessions: 45, duration: 38, satisfaction: 4.8 },
  { day: "Tue", sessions: 52, duration: 42, satisfaction: 4.7 },
  { day: "Wed", sessions: 48, duration: 35, satisfaction: 4.9 },
  { day: "Thu", sessions: 61, duration: 40, satisfaction: 4.8 },
  { day: "Fri", sessions: 58, duration: 37, satisfaction: 4.6 },
  { day: "Sat", sessions: 35, duration: 45, satisfaction: 4.9 },
  { day: "Sun", sessions: 28, duration: 48, satisfaction: 4.8 },
]

const therapistPerformance = [
  { name: "Dr. Emily Chen", sessions: 156, rating: 4.9, revenue: 18500 },
  { name: "Dr. Sarah Williams", sessions: 142, rating: 4.8, revenue: 16800 },
  { name: "Dr. James Thompson", sessions: 138, rating: 4.7, revenue: 16200 },
  { name: "Dr. Maria Garcia", sessions: 134, rating: 4.8, revenue: 15900 },
  { name: "Dr. Michael Brown", sessions: 128, rating: 4.6, revenue: 15200 },
]

const conditionBreakdown = [
  { name: "Back Pain", value: 35, color: "#3b82f6" },
  { name: "Knee Issues", value: 25, color: "#10b981" },
  { name: "Shoulder Pain", value: 20, color: "#f59e0b" },
  { name: "Neck Pain", value: 12, color: "#ef4444" },
  { name: "Other", value: 8, color: "#8b5cf6" },
]

const deviceUsage = [
  { name: "Desktop", value: 45, color: "#3b82f6" },
  { name: "Mobile", value: 35, color: "#10b981" },
  { name: "Tablet", value: 20, color: "#f59e0b" },
]

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const kpiData = [
    {
      title: "Total Revenue",
      value: "$331,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Patients",
      value: "1,532",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Sessions",
      value: "1,350",
      change: "+15.3%",
      trend: "up",
      icon: Video,
      color: "text-purple-600",
    },
    {
      title: "Avg Rating",
      value: "4.8",
      change: "+0.2",
      trend: "up",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      title: "Session Duration",
      value: "42 min",
      change: "+3.1%",
      trend: "up",
      icon: Clock,
      color: "text-indigo-600",
    },
    {
      title: "Completion Rate",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: Activity,
      color: "text-teal-600",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center mt-1">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="therapists">Therapists</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue and booking trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "revenue" ? `$${value.toLocaleString()}` : value,
                        name === "revenue" ? "Revenue" : "Bookings",
                      ]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="bookings" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users and retention rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="activeUsers" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Condition Breakdown</CardTitle>
                <CardDescription>Most common patient conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={conditionBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {conditionBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>Platform access by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deviceUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>User acquisition and retention metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} name="New Users" />
                  <Line type="monotone" dataKey="activeUsers" stroke="#10b981" strokeWidth={2} name="Active Users" />
                  <Line type="monotone" dataKey="retention" stroke="#f59e0b" strokeWidth={2} name="Retention %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Analytics</CardTitle>
              <CardDescription>Daily session metrics and satisfaction scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
                  <Bar dataKey="duration" fill="#10b981" name="Avg Duration (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="therapists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Therapist Performance</CardTitle>
              <CardDescription>Top performing therapists by sessions and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {therapistPerformance.map((therapist, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {therapist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="font-semibold">{therapist.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <span>{therapist.sessions} sessions</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {therapist.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${therapist.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
