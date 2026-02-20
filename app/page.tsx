"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { motion } from "framer-motion"
import {
  FileText,
  Zap,
  Target,
  Calendar,
  BarChart3,
  GraduationCap,
  Briefcase,
  Users,
} from "lucide-react"

const features = [
  {
    title: "Resume Wizard",
    description: "Build professional resumes with guided templates",
    icon: FileText,
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    title: "Live Eligibility Feed",
    description: "Real-time drive updates matching your profile",
    icon: Zap,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Criteria Engine",
    description: "Smart filtering by CGPA, branch & skills",
    icon: Target,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Interview Scheduler",
    description: "Drag & drop calendar for seamless scheduling",
    icon: Calendar,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Application Tracker",
    description: "Track status from applied to selected",
    icon: BarChart3,
    gradient: "from-cyan-500 to-teal-500",
  },
]

const roles = [
  {
    title: "For TPO",
    description: "Manage placement drives efficiently",
    icon: Briefcase,
    items: ["Create and manage drives", "Smart eligibility filtering", "Real-time analytics", "Interview scheduling"],
  },
  {
    title: "For Students",
    description: "Track your placement journey",
    icon: GraduationCap,
    items: ["View eligible drives", "Application tracking", "Skill gap analysis", "Resume builder"],
  },
  {
    title: "For Alumni",
    description: "Give back to your campus",
    icon: Users,
    items: ["Post job referrals", "Mentorship sessions", "Connect with students", "Career guidance"],
  },
]

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjViZjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome to EduNexus
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 font-medium">
                Smart Placement Automation Platform
              </p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                <Link href="/auth/signin">
                  <Button
                    size="lg"
                    className="rounded-xl px-8 py-6 text-base bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl px-8 py-6 text-base border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300"
                  >
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Everything You Need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            A complete placement management suite designed for modern campuses
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="group rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${feature.gradient}`} />
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Role Cards */}
        <section className="container mx-auto px-4 pb-24">
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="rounded-2xl border shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                      <role.icon className="h-7 w-7 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription className="text-base">{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {role.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      <Toaster />
    </>
  )
}
