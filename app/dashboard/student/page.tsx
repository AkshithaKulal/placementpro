"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Briefcase,
  FileText,
  TrendingUp,
  User,
  Rss,
  FolderKanban,
  ClipboardList,
  BarChart3,
  Target,
  GraduationCap,
} from "lucide-react"

interface Stats {
  eligibleDrives: number
  applications: number
  shortlisted: number
  selected: number
}

const statCards = [
  {
    key: "eligibleDrives",
    label: "Eligible Drives",
    icon: Briefcase,
    gradient: "from-indigo-500 to-blue-600",
    shadow: "shadow-indigo-500/20",
  },
  {
    key: "applications",
    label: "Applied",
    icon: FileText,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
  },
  {
    key: "selected",
    label: "Selected",
    icon: User,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
  },
] as const

const quickActions = [
  { href: "/dashboard/student/feed", label: "Live Feed", icon: Rss },
  { href: "/dashboard/student/drives", label: "Browse Drives", icon: FolderKanban },
  { href: "/dashboard/student/applications", label: "My Applications", icon: ClipboardList },
  { href: "/dashboard/student/skill-gap", label: "Skill Gap Analysis", icon: Target },
  { href: "/dashboard/student/market-intelligence", label: "Market Intelligence", icon: BarChart3 },
  { href: "/dashboard/student/resume", label: "Resume Builder", icon: FileText },
]

export default function StudentDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({
    eligibleDrives: 0,
    applications: 0,
    shortlisted: 0,
    selected: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/student/stats")
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

  const progressPercent =
    stats.applications > 0 ? Math.min(100, (stats.selected / stats.applications) * 100 * 2) : 0

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
            Student Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Track your placement journey</p>
        </div>
        <Link href="/dashboard/student/profile">
          <Button variant="outline" className="rounded-xl">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
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
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? (
                    <span className="inline-block w-12 h-8 rounded-lg bg-muted animate-pulse" />
                  ) : (
                    stats[card.key]
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl h-11 hover:bg-indigo-50/50 hover:border-indigo-200 group"
                  >
                    <action.icon className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-indigo-600" />
                    {action.label}
                  </Button>
                </Link>
              ))}
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
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>Complete your profile for better placements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Placement Progress</span>
                  <span className="font-medium">
                    {stats.applications > 0
                      ? `${Math.round((stats.selected / stats.applications) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
              <Link href="/dashboard/student/profile">
                <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25">
                  Update Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
