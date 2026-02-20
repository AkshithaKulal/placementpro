"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface Profile {
  enrollmentNo: string
  branch: string
  year: number
  CGPA: number
  backlogs: number
  skills: string[]
  phone?: string
  address?: string
  linkedin?: string
  github?: string
}

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "AE", "BT", "CHE"]

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    enrollmentNo: "",
    branch: "CSE",
    year: 2024,
    CGPA: 0,
    backlogs: 0,
    skills: [],
    phone: "",
    address: "",
    linkedin: "",
    github: "",
  })
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/student/profile")
      const data = await response.json()
      if (response.ok) {
        setProfile(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })

      router.push("/dashboard/student")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-gray-600">Update your student profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Keep your profile up to date</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrollmentNo">Enrollment Number *</Label>
                <Input
                  id="enrollmentNo"
                  value={profile.enrollmentNo}
                  onChange={(e) =>
                    setProfile({ ...profile, enrollmentNo: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <select
                  id="branch"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={profile.branch}
                  onChange={(e) =>
                    setProfile({ ...profile, branch: e.target.value })
                  }
                  required
                >
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  min="2020"
                  max="2030"
                  value={profile.year}
                  onChange={(e) =>
                    setProfile({ ...profile, year: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="CGPA">CGPA *</Label>
                <Input
                  id="CGPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={profile.CGPA}
                  onChange={(e) =>
                    setProfile({ ...profile, CGPA: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backlogs">Backlogs</Label>
              <Input
                id="backlogs"
                type="number"
                min="0"
                value={profile.backlogs}
                onChange={(e) =>
                  setProfile({ ...profile, backlogs: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={profile.address || ""}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={profile.linkedin || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, linkedin: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  type="url"
                  value={profile.github || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, github: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                  placeholder="Add a skill"
                />
                <Button type="button" onClick={addSkill}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
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
