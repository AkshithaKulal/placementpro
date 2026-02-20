"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserRole } from "@prisma/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const role = session.user.role

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                PlacementPro
              </Link>
              <div className="flex gap-4">
                {role === UserRole.TPO && (
                  <>
                    <Link href="/dashboard/tpo" className="text-sm hover:text-primary">
                      TPO Dashboard
                    </Link>
                    <Link href="/dashboard/tpo/control-center" className="text-sm hover:text-primary">
                      Control Center
                    </Link>
                    <Link href="/dashboard/tpo/drives" className="text-sm hover:text-primary">
                      Drives
                    </Link>
                    <Link href="/dashboard/tpo/market-intelligence" className="text-sm hover:text-primary">
                      Market Intelligence
                    </Link>
                  </>
                )}
                {role === UserRole.STUDENT && (
                  <>
                    <Link href="/dashboard/student" className="text-sm hover:text-primary">
                      Student Dashboard
                    </Link>
                    <Link href="/dashboard/student/feed" className="text-sm hover:text-primary">
                      Live Feed
                    </Link>
                    <Link href="/dashboard/student/skill-gap" className="text-sm hover:text-primary">
                      Skill Gap
                    </Link>
                    <Link href="/dashboard/student/market-intelligence" className="text-sm hover:text-primary">
                      Market Intelligence
                    </Link>
                    <Link href="/dashboard/student/resume" className="text-sm hover:text-primary">
                      Resume Builder
                    </Link>
                    <Link href="/dashboard/student/placementbot" className="text-sm hover:text-primary">
                      PlacementBot
                    </Link>
                  </>
                )}
                {role === UserRole.ALUMNI && (
                  <>
                    <Link href="/dashboard/alumni" className="text-sm hover:text-primary">
                      Alumni Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
