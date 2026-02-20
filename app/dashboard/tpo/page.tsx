"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Users, Briefcase, TrendingUp, LayoutDashboard } from "lucide-react"

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">TPO Dashboard</h1>
          <p className="text-gray-600">Manage placement drives and track analytics</p>
        </div>
        <Link href="/dashboard/tpo/drives/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Drive
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drives</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalDrives}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drives</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.activeDrives}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalStudents}</div>
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
            <Link href="/dashboard/tpo/control-center" className="block">
              <Button variant="outline" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Control Center
              </Button>
            </Link>
            <Link href="/dashboard/tpo/drives" className="block">
              <Button variant="outline" className="w-full justify-start">
                View All Drives
              </Button>
            </Link>
            <Link href="/dashboard/tpo/drives/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                Create New Drive
              </Button>
            </Link>
            <Link href="/dashboard/tpo/analytics" className="block">
              <Button variant="outline" className="w-full justify-start">
                View Analytics
              </Button>
            </Link>
            <Link href="/dashboard/tpo/market-intelligence" className="block">
              <Button variant="outline" className="w-full justify-start">
                Market Intelligence
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
