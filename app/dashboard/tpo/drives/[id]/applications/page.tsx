"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { ApplicationStatus } from "@prisma/client"

interface Application {
  id: string
  status: ApplicationStatus
  appliedAt: string
  student: {
    enrollmentNo: string
    branch: string
    CGPA: number
    backlogs: number
    user: {
      name: string | null
      email: string
    }
  }
}

export default function ApplicationsPage() {
  const params = useParams()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  useEffect(() => {
    fetchApplications()
  }, [params.id, statusFilter])

  const fetchApplications = async () => {
    try {
      const url = `/api/tpo/drives/${params.id}/applications${
        statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
      }`
      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        setApplications(data)
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const response = await fetch(`/api/tpo/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchApplications()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-gray-600">Manage student applications</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Applied</SelectItem>
            <SelectItem value="APTITUDE">Aptitude</SelectItem>
            <SelectItem value="CLEARED">Cleared</SelectItem>
            <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
            <SelectItem value="SELECTED">Selected</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">No applications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="font-semibold text-lg">
                      {app.student.user.name || app.student.user.email}
                    </div>
                    <div className="text-sm text-gray-600">
                      {app.student.enrollmentNo} • {app.student.branch}
                    </div>
                    <div className="text-sm">
                      CGPA: {app.student.CGPA} • Backlogs: {app.student.backlogs}
                    </div>
                    <div className="text-xs text-gray-500">
                      Applied: {formatDate(app.appliedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={app.status}
                      onValueChange={(value: ApplicationStatus) =>
                        updateStatus(app.id, value)
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Applied</SelectItem>
                        <SelectItem value="APTITUDE">Aptitude</SelectItem>
                        <SelectItem value="CLEARED">Cleared</SelectItem>
                        <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="SELECTED">Selected</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
