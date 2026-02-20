"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserRole } from "@prisma/client"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Settings2,
  FolderKanban,
  BarChart3,
  Rss,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Users,
  LogOut,
} from "lucide-react"

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center animate-pulse" />
          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "60%" }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const role = session.user.role

  const navLinks =
    role === UserRole.TPO
      ? [
          { href: "/dashboard/tpo", label: "TPO Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/tpo/control-center", label: "Control Center", icon: Settings2 },
          { href: "/dashboard/tpo/drives", label: "Drives", icon: FolderKanban },
          { href: "/dashboard/tpo/market-intelligence", label: "Market Intelligence", icon: BarChart3 },
        ]
      : role === UserRole.STUDENT
      ? [
          { href: "/dashboard/student", label: "Student Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/student/feed", label: "Live Feed", icon: Rss },
          { href: "/dashboard/student/skill-gap", label: "Skill Gap", icon: TrendingUp },
          { href: "/dashboard/student/market-intelligence", label: "Market Intelligence", icon: BarChart3 },
          { href: "/dashboard/student/resume", label: "Resume Builder", icon: Briefcase },
          { href: "/dashboard/student/placementbot", label: "PlacementBot", icon: GraduationCap },
        ]
      : role === UserRole.ALUMNI
      ? [{ href: "/dashboard/alumni", label: "Alumni Dashboard", icon: Users }]
      : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/30">
      <nav className="sticky top-0 z-50 glass border-b border-white/50 shadow-glass">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link
                href="/dashboard"
                className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
              >
                EduNexus
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/60 transition-all duration-200"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[180px]">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl border-2 hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
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
