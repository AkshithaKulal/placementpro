"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, FileText, TrendingUp, User } from "lucide-react"

interface Stats {
  eligibleDrives: number
  applications: number
  shortlisted: number
  selected: number
}

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600">Track your placement journey</p>
        </div>
        <Link href="/dashboard/student/profile">
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Drives</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.eligibleDrives}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.applications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.shortlisted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.selected}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/student/feed" className="block">
              <Button variant="outline" className="w-full justify-start">
                Live Feed
              </Button>
            </Link>
            <Link href="/dashboard/student/drives" className="block">
              <Button variant="outline" className="w-full justify-start">
                Browse Drives
              </Button>
            </Link>
            <Link href="/dashboard/student/applications" className="block">
              <Button variant="outline" className="w-full justify-start">
                My Applications
              </Button>
            </Link>
            <Link href="/dashboard/student/skill-gap" className="block">
              <Button variant="outline" className="w-full justify-start">
                Skill Gap Analysis
              </Button>
            </Link>
            <Link href="/dashboard/student/market-intelligence" className="block">
              <Button variant="outline" className="w-full justify-start">
                Market Intelligence
              </Button>
            </Link>
            <Link href="/dashboard/student/resume" className="block">
              <Button variant="outline" className="w-full justify-start">
                Resume Builder
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile Status</CardTitle>
            <CardDescription>Complete your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/student/profile">
              <Button className="w-full">Update Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
