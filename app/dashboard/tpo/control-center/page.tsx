"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, Briefcase, Activity, FileCheck } from "lucide-react"
import { formatDate } from "@/lib/utils"

type StudentRow = {
  id: string
  name: string | null
  email: string
  enrollmentNo: string
  branch: string
  year: number
  CGPA: number
}

type DriveRow = {
  id: string
  title: string
  company: string
  status: string
  _count: { applications: number }
  createdAt: string
}

type RecentApplied = {
  id: string
  studentName: string | null
  studentEmail: string
  driveTitle: string
  driveCompany: string
  status: string
  appliedAt: string
}

type ControlCenterData = {
  totalStudents: number
  totalCompanies: number
  totalDrives: number
  students: StudentRow[]
  companies: string[]
  drives: DriveRow[]
  activeDrives: DriveRow[]
  recentApplied: RecentApplied[]
}

export default function TPOControlCenterPage() {
  const [data, setData] = useState<ControlCenterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<"students" | "companies" | "drives" | "active" | "recent" | null>(null)

  useEffect(() => {
    fetch("/api/tpo/control-center")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) return
        setData(d)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading control center...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Failed to load data</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">TPO Control Center</h1>
        <p className="text-muted-foreground mt-1">
          Overview of students, companies, drives, and recent applications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 px-0 h-auto text-primary"
              onClick={() => setExpanded(expanded === "students" ? null : "students")}
            >
              {expanded === "students" ? "Hide list" : "View who"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCompanies}</div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 px-0 h-auto text-primary"
              onClick={() => setExpanded(expanded === "companies" ? null : "companies")}
            >
              {expanded === "companies" ? "Hide list" : "View which"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drives</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDrives}</div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 px-0 h-auto text-primary"
              onClick={() => setExpanded(expanded === "drives" ? null : "drives")}
            >
              {expanded === "drives" ? "Hide list" : "View all"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drives</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeDrives.length}</div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 px-0 h-auto text-primary"
              onClick={() => setExpanded(expanded === "active" ? null : "active")}
            >
              {expanded === "active" ? "Hide list" : "View which & all"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {expanded === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>Total: {data.students.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Enrollment</th>
                    <th className="text-left p-3 font-medium">Branch</th>
                    <th className="text-left p-3 font-medium">Year</th>
                    <th className="text-left p-3 font-medium">CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3">{s.name ?? "—"}</td>
                      <td className="p-3">{s.email}</td>
                      <td className="p-3">{s.enrollmentNo}</td>
                      <td className="p-3">{s.branch}</td>
                      <td className="p-3">{s.year}</td>
                      <td className="p-3">{s.CGPA}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expanded === "companies" && (
        <Card>
          <CardHeader>
            <CardTitle>Companies</CardTitle>
            <CardDescription>Unique companies from drives</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {data.companies.map((c) => (
                <li key={c}>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm">
                    {c}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {expanded === "drives" && (
        <Card>
          <CardHeader>
            <CardTitle>All Drives</CardTitle>
            <CardDescription>Total: {data.drives.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium">Company</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Applications</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-left p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.drives.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="p-3">{d.title}</td>
                      <td className="p-3">{d.company}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            d.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : d.status === "CLOSED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3">{d._count.applications}</td>
                      <td className="p-3">{formatDate(d.createdAt)}</td>
                      <td className="p-3">
                        <Link href={`/dashboard/tpo/drives/${d.id}`}>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expanded === "active" && (
        <Card>
          <CardHeader>
            <CardTitle>Active Drives</CardTitle>
            <CardDescription>Which and all active drives</CardDescription>
          </CardHeader>
          <CardContent>
            {data.activeDrives.length === 0 ? (
              <p className="text-muted-foreground">No active drives</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Title</th>
                      <th className="text-left p-3 font-medium">Company</th>
                      <th className="text-left p-3 font-medium">Applications</th>
                      <th className="text-left p-3 font-medium">Created</th>
                      <th className="text-left p-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.activeDrives.map((d) => (
                      <tr key={d.id} className="border-t">
                        <td className="p-3">{d.title}</td>
                        <td className="p-3">{d.company}</td>
                        <td className="p-3">{d._count.applications}</td>
                        <td className="p-3">{formatDate(d.createdAt)}</td>
                        <td className="p-3">
                          <Link href={`/dashboard/tpo/drives/${d.id}`}>
                            <Button variant="link" size="sm" className="h-auto p-0">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Recently Applied Students
          </CardTitle>
          <CardDescription>Latest applications across drives</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentApplied.length === 0 ? (
            <p className="text-muted-foreground">No applications yet</p>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">Student</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Drive</th>
                    <th className="text-left p-3 font-medium">Company</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplied.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-3">{a.studentName ?? "—"}</td>
                      <td className="p-3">{a.studentEmail}</td>
                      <td className="p-3">{a.driveTitle}</td>
                      <td className="p-3">{a.driveCompany}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-muted">
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3">{formatDate(a.appliedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href="/dashboard/tpo">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
        <Link href="/dashboard/tpo/drives/new">
          <Button>Create Drive</Button>
        </Link>
      </div>
    </div>
  )
}
