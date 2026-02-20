"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserRole } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session) {
      const role = session.user.role
      if (role === UserRole.TPO) {
        router.push("/dashboard/tpo")
      } else if (role === UserRole.STUDENT) {
        router.push("/dashboard/student")
      } else if (role === UserRole.ALUMNI) {
        router.push("/dashboard/alumni")
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to PlacementPro</CardTitle>
          <CardDescription>Select your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/dashboard/tpo">
            <Button>TPO Dashboard</Button>
          </Link>
          <Link href="/dashboard/student">
            <Button>Student Dashboard</Button>
          </Link>
          <Link href="/dashboard/alumni">
            <Button>Alumni Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
