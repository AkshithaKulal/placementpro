"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { DriveStatus } from "@prisma/client"
import { Users, Calendar, MapPin, DollarSign, Bell, CalendarDays } from "lucide-react"

interface Drive {
  id: string
  title: string
  description: string
  company: string
  status: DriveStatus
  minCGPA: number
  maxBacklogs: number
  eligibleBranches: string[]
  location?: string
  package?: string
  registrationDeadline?: string
  createdAt: string
}

interface EligibleStudent {
  id: string
  name: string
  email: string
  branch: string
  CGPA: number
  enrollmentNo: string
}

interface EligibleResponse {
  eligibleCount: number
  students: EligibleStudent[]
}

export default function DriveDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [drive, setDrive] = useState<Drive | null>(null)
  const [eligible, setEligible] = useState<EligibleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifying, setNotifying] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDrive()
      fetchEligible()
    }
  }, [params.id])

  const fetchDrive = async () => {
    try {
      const response = await fetch(`/api/tpo/drives/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setDrive(data)
      }
    } catch (error) {
      console.error("Failed to fetch drive:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEligible = async () => {
    try {
      const response = await fetch(`/api/tpo/drives/${params.id}/eligible-students`)
      const data = await response.json()
      if (response.ok) {
        setEligible(data)
      }
    } catch (error) {
      console.error("Failed to fetch eligible students:", error)
    }
  }

  const handleNotifyAll = async () => {
    setNotifying(true)
    try {
      const res = await fetch(`/api/tpo/drives/${params.id}/notify`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        alert(`Notifications sent: ${data.notified} in-app, ${data.emailsSent} emails.`)
      } else {
        alert(data.error || "Failed to send notifications")
      }
    } catch (e) {
      alert("Failed to send notifications")
    } finally {
      setNotifying(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!drive) {
    return <div className="text-center py-8">Drive not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{drive.title}</h1>
          <p className="text-gray-600">{drive.company}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            drive.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : drive.status === "CLOSED"
              ? "bg-gray-100 text-gray-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {drive.status}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drive Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{drive.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {drive.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{drive.location}</span>
              </div>
            )}
            {drive.package && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{drive.package}</span>
              </div>
            )}
            {drive.registrationDeadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {formatDate(drive.registrationDeadline)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eligibility Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Minimum CGPA</div>
              <div className="text-lg font-semibold">{drive.minCGPA}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Maximum Backlogs</div>
              <div className="text-lg font-semibold">{drive.maxBacklogs}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Eligible Branches</div>
              <div className="text-lg font-semibold">
                {drive.eligibleBranches.length > 0
                  ? drive.eligibleBranches.join(", ")
                  : "All Branches"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Eligible Students
          </CardTitle>
          <CardDescription>
            Students matching criteria (CGPA, backlogs, branch, ≥50% skill match)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {eligible ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-3xl font-bold text-primary">
                  {eligible.eligibleCount} Students Eligible
                </div>
                {drive.status === "ACTIVE" && (
                  <Button
                    onClick={handleNotifyAll}
                    disabled={notifying || eligible.eligibleCount === 0}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    {notifying ? "Sending…" : "Notify All Eligible Students"}
                  </Button>
                )}
              </div>
              {eligible.students.length > 0 && (
                <div className="overflow-x-auto rounded-md border max-h-[320px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Branch</th>
                        <th className="text-left p-3 font-medium">CGPA</th>
                        <th className="text-left p-3 font-medium">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligible.students.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="p-3">{s.name}</td>
                          <td className="p-3">{s.branch}</td>
                          <td className="p-3">{s.CGPA}</td>
                          <td className="p-3">{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">Calculating...</div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button onClick={() => router.push(`/dashboard/tpo/drives/${params.id}/applications`)}>
          View Applications
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/tpo/drives/${params.id}/schedule`)}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Schedule Interviews
        </Button>
      </div>
    </div>
  )
}
