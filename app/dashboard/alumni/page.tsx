"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Briefcase, Users } from "lucide-react"

interface Stats {
  jobReferrals: number
  mentorshipSlots: number
  bookedSlots: number
}

export default function AlumniDashboard() {
  const [stats, setStats] = useState<Stats>({
    jobReferrals: 0,
    mentorshipSlots: 0,
    bookedSlots: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/alumni/stats")
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
          <h1 className="text-3xl font-bold">Alumni Dashboard</h1>
          <p className="text-gray-600">Help students with referrals and mentorship</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Referrals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.jobReferrals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorship Slots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.mentorshipSlots}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booked Slots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.bookedSlots}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Referrals</CardTitle>
            <CardDescription>Post job opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/alumni/referrals" className="block">
              <Button variant="outline" className="w-full justify-start">
                View All Referrals
              </Button>
            </Link>
            <Link href="/dashboard/alumni/referrals/new" className="block">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Post New Referral
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mentorship</CardTitle>
            <CardDescription>Create mentorship slots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/alumni/mentorship" className="block">
              <Button variant="outline" className="w-full justify-start">
                View All Slots
              </Button>
            </Link>
            <Link href="/dashboard/alumni/mentorship/new" className="block">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Slot
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
