"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

interface Drive {
  id: string
  title: string
  company: string
  description: string
  minCGPA: number
  maxBacklogs: number
  eligibleBranches: string[]
  location?: string
  package?: string
  registrationDeadline?: string
  isEligible: boolean
  hasApplied: boolean
}

export default function DrivesPage() {
  const searchParams = useSearchParams()
  const driveIdFromUrl = searchParams.get("driveId")
  const [drives, setDrives] = useState<Drive[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const driveCardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    fetchDrives()
  }, [])

  // When opened from email link with ?driveId=..., scroll to that drive
  useEffect(() => {
    if (!driveIdFromUrl || !drives.length) return
    const el = driveCardRefs.current[driveIdFromUrl]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [driveIdFromUrl, drives])

  const fetchDrives = async () => {
    try {
      const response = await fetch("/api/student/drives")
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

  const handleApply = async (driveId: string) => {
    try {
      const response = await fetch("/api/student/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply")
      }

      toast({
        title: "Success",
        description: "Application submitted successfully!",
      })

      fetchDrives()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Drives</h1>
        <p className="text-gray-600">Browse and apply to placement drives</p>
      </div>

      {drives.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">No drives available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drives.map((drive) => (
            <Card
              key={drive.id}
              ref={(node) => {
                driveCardRefs.current[drive.id] = node
              }}
              id={driveIdFromUrl === drive.id ? "highlight-drive" : undefined}
              className={driveIdFromUrl === drive.id ? "ring-2 ring-primary/50" : undefined}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{drive.title}</CardTitle>
                    <CardDescription>{drive.company}</CardDescription>
                  </div>
                  {drive.isEligible ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Eligible</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Not Eligible</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {drive.description}
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Min CGPA:</span> {drive.minCGPA}
                  </div>
                  <div>
                    <span className="font-medium">Max Backlogs:</span> {drive.maxBacklogs}
                  </div>
                  <div>
                    <span className="font-medium">Branches:</span>{" "}
                    {drive.eligibleBranches.length > 0
                      ? drive.eligibleBranches.join(", ")
                      : "All"}
                  </div>
                  {drive.location && (
                    <div>
                      <span className="font-medium">Location:</span> {drive.location}
                    </div>
                  )}
                  {drive.package && (
                    <div>
                      <span className="font-medium">Package:</span> {drive.package}
                    </div>
                  )}
                  {drive.registrationDeadline && (
                    <div>
                      <span className="font-medium">Deadline:</span>{" "}
                      {formatDate(drive.registrationDeadline)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {drive.hasApplied ? (
                    <Button disabled className="w-full">
                      Already Applied
                    </Button>
                  ) : drive.isEligible ? (
                    <Button
                      onClick={() => handleApply(drive.id)}
                      className="w-full"
                    >
                      Apply Now
                    </Button>
                  ) : (
                    <Button disabled className="w-full" variant="outline">
                      Not Eligible
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
