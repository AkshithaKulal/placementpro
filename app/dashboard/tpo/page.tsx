"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Plus,
  Users,
  Briefcase,
  TrendingUp,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const statCards = [
  {
    key: "totalDrives",
    label: "Total Drives",
    icon: Briefcase,
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    key: "activeDrives",
    label: "Active Drives",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    key: "totalApplications",
    label: "Applications",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    key: "totalStudents",
    label: "Total Students",
    icon: Users,
    gradient: "from-emerald-500 to-teal-600",
  },
] as const

export default function TPODashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalDrives: 0,
    activeDrives: 0,
    totalApplications: 0,
    totalStudents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/tpo/stats")
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = [
    { name: "Total Drives", value: stats.totalDrives, fill: "#6366f1" },
    { name: "Active", value: stats.activeDrives, fill: "#8b5cf6" },
    { name: "Applications", value: stats.totalApplications, fill: "#0ea5e9" },
    { name: "Students", value: stats.totalStudents, fill: "#10b981" },
  ].filter((d) => d.value > 0)

  const barData = [
    { label: "Total Drives", value: stats.totalDrives },
    { label: "Active Drives", value: stats.activeDrives },
    { label: "Applications", value: stats.totalApplications },
    { label: "Students", value: stats.totalStudents },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            TPO Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage placement drives and track analytics</p>
        </div>
        <Link href="/dashboard/tpo/drives/new">
          <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25">
            <Plus className="mr-2 h-4 w-4" />
            Create Drive
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
              <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? (
                    <span className="inline-block w-12 h-8 rounded-lg bg-muted animate-pulse" />
                  ) : (
                    stats[card.key as keyof typeof stats]
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/tpo/control-center" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl h-11 hover:bg-indigo-50/50 hover:border-indigo-200">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Control Center
                </Button>
              </Link>
              <Link href="/dashboard/tpo/drives" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl h-11 hover:bg-indigo-50/50 hover:border-indigo-200">
                  View All Drives
                </Button>
              </Link>
              <Link href="/dashboard/tpo/drives/new" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl h-11 hover:bg-indigo-50/50 hover:border-indigo-200">
                  Create New Drive
                </Button>
              </Link>
              <Link href="/dashboard/tpo/analytics" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl h-11 hover:bg-indigo-50/50 hover:border-indigo-200">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/dashboard/tpo/market-intelligence" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl h-11 hover:bg-indigo-50/50 hover:border-indigo-200">
                  Market Intelligence
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Drive & application distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {barData.some((d) => d.total > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
