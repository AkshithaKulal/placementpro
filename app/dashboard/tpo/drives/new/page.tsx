"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DriveStatus } from "@prisma/client"

const BRANCHES = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "ME",
  "CE",
  "AE",
  "BT",
  "CHE",
]

export default function NewDrivePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    status: "DRAFT" as DriveStatus,
    minCGPA: "",
    maxBacklogs: "0",
    eligibleBranches: [] as string[],
    requiredSkills: [] as string[],
    location: "",
    package: "",
    registrationDeadline: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/tpo/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create drive")
      }

      toast({
        title: "Success",
        description: "Drive created successfully!",
      })

      router.push(`/dashboard/tpo/drives/${data.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleBranch = (branch: string) => {
    setFormData({
      ...formData,
      eligibleBranches: formData.eligibleBranches.includes(branch)
        ? formData.eligibleBranches.filter((b) => b !== branch)
        : [...formData.eligibleBranches, branch],
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Placement Drive</h1>
        <p className="text-gray-600">Define eligibility criteria and drive details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drive Information</CardTitle>
          <CardDescription>Basic details about the placement drive</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Software Engineer - 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="package">Package</Label>
                <Input
                  id="package"
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  placeholder="e.g., 12 LPA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: DriveStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) =>
                  setFormData({ ...formData, registrationDeadline: e.target.value })
                }
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Eligibility Criteria</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCGPA">Minimum CGPA *</Label>
                  <Input
                    id="minCGPA"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.minCGPA}
                    onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBacklogs">Maximum Backlogs</Label>
                  <Input
                    id="maxBacklogs"
                    type="number"
                    min="0"
                    value={formData.maxBacklogs}
                    onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label>Eligible Branches</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BRANCHES.map((branch) => (
                    <label key={branch} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.eligibleBranches.includes(branch)}
                        onChange={() => toggleBranch(branch)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{branch}</span>
                    </label>
                  ))}
                </div>
                {formData.eligibleBranches.length === 0 && (
                  <p className="text-sm text-gray-500">Leave empty for all branches</p>
                )}
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="requiredSkills">Required Skills (comma-separated)</Label>
                <Input
                  id="requiredSkills"
                  placeholder="e.g., JavaScript, React, SQL"
                  value={formData.requiredSkills.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiredSkills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Feed shows drives where student has ≥50% of these skills
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Drive"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
