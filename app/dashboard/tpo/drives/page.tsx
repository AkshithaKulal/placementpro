"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { DriveStatus } from "@prisma/client"

interface Drive {
  id: string
  title: string
  company: string
  status: DriveStatus
  minCGPA: number
  maxBacklogs: number
  eligibleBranches: string[]
  createdAt: string
  _count: {
    applications: number
  }
}

export default function DrivesPage() {
  const [drives, setDrives] = useState<Drive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      const response = await fetch("/api/tpo/drives")
      const data = await response.json()
      if (response.ok) {
        setDrives(data)
      }
    } catch (error) {
      console.error("Failed to fetch drives:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Placement Drives</h1>
          <p className="text-gray-600">Manage all placement drives</p>
        </div>
        <Link href="/dashboard/tpo/drives/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Drive
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : drives.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600 mb-4">No drives found</p>
            <Link href="/dashboard/tpo/drives/new">
              <Button>Create Your First Drive</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {drives.map((drive) => (
            <Card key={drive.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{drive.title}</CardTitle>
                    <CardDescription>{drive.company}</CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
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
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Min CGPA:</span> {drive.minCGPA}
                  </div>
                  <div>
                    <span className="font-medium">Max Backlogs:</span> {drive.maxBacklogs}
                  </div>
                  <div>
                    <span className="font-medium">Branches:</span>{" "}
                    {drive.eligibleBranches.join(", ") || "All"}
                  </div>
                  <div>
                    <span className="font-medium">Applications:</span> {drive._count.applications}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(drive.createdAt)}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/dashboard/tpo/drives/${drive.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
