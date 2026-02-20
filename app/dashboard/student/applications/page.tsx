"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { ApplicationStatus } from "@prisma/client"
import { Check } from "lucide-react"

interface Application {
  id: string
  status: ApplicationStatus
  appliedAt: string
  drive: {
    id: string
    title: string
    company: string
    status: string
    package?: string
  }
}

const STATUS_ORDER: ApplicationStatus[] = [
  "PENDING",
  "APTITUDE",
  "CLEARED",
  "INTERVIEW_SCHEDULED",
  "SHORTLISTED",
  "SELECTED",
  "REJECTED",
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Applied",
  APTITUDE: "Aptitude",
  CLEARED: "Cleared",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  SHORTLISTED: "Shortlisted",
  SELECTED: "Selected",
  REJECTED: "Rejected",
}

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: "bg-slate-100 text-slate-800",
  APTITUDE: "bg-amber-100 text-amber-800",
  CLEARED: "bg-cyan-100 text-cyan-800",
  INTERVIEW_SCHEDULED: "bg-violet-100 text-violet-800",
  SHORTLISTED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  SELECTED: "bg-green-100 text-green-800",
}

function ProgressTracker({ currentStatus }: { currentStatus: ApplicationStatus }) {
  const steps: ApplicationStatus[] = [
    "PENDING",
    "APTITUDE",
    "CLEARED",
    "INTERVIEW_SCHEDULED",
    "SELECTED",
  ]
  const currentIdx = steps.indexOf(currentStatus)
  const isRejected = currentStatus === "REJECTED"
  const isSelected = currentStatus === "SELECTED"
  const endState = isRejected || isSelected
  const displayIdx = isRejected ? 4 : isSelected ? 5 : currentIdx < 0 ? 0 : currentIdx

  return (
    <div className="flex items-center justify-between gap-1 py-2">
      {steps.map((stepStatus, i) => {
        const label = STATUS_LABELS[stepStatus]
        const isDone = displayIdx > i || (displayIdx === i && (isRejected || isSelected))
        const isCurrent = displayIdx === i && !endState
        return (
          <div key={stepStatus} className="flex flex-1 items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-xs mt-1 text-center text-gray-600">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${displayIdx > i ? "bg-green-500" : "bg-gray-200"}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/student/applications")
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Application Tracker</h1>
        <p className="text-gray-600">Track status: Applied → Aptitude → Cleared → Interview → Selected / Rejected</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No applications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{app.drive.title}</CardTitle>
                    <CardDescription>
                      {app.drive.company}
                      {app.drive.package && ` • ${app.drive.package}`}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[app.status]}`}
                  >
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressTracker currentStatus={app.status} />
                <div className="text-sm text-gray-500 border-t pt-3">
                  Applied on: {formatDate(app.appliedAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
