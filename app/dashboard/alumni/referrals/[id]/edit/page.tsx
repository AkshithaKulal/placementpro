"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function EditReferralPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    description: "",
    requirements: [] as string[],
    link: "",
    isActive: true,
  })
  const [newRequirement, setNewRequirement] = useState("")

  useEffect(() => {
    if (id) {
      fetchReferral()
    }
  }, [id])

  const fetchReferral = async () => {
    try {
      const response = await fetch(`/api/alumni/referrals/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load referral")
      }

      setFormData({
        company: data.company || "",
        position: data.position || "",
        description: data.description || "",
        requirements: data.requirements || [],
        link: data.link || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load referral",
        variant: "destructive",
      })
      router.push("/dashboard/alumni/referrals")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/alumni/referrals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update referral")
      }

      toast({
        title: "Success",
        description: "Referral updated successfully!",
      })

      router.push("/dashboard/alumni/referrals")
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

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      })
      setNewRequirement("")
    }
  }

  const removeRequirement = (req: string) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((r) => r !== req),
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading referral...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Job Referral</h1>
        <p className="text-gray-600">Update your job referral details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral Details</CardTitle>
          <CardDescription>Update the information about this job opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Job Link</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Requirements</Label>
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addRequirement()
                    }
                  }}
                  placeholder="Add requirement"
                />
                <Button type="button" onClick={addRequirement}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requirements.map((req) => (
                  <span
                    key={req}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(req)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-input"
              />
              <Label htmlFor="isActive">Active (visible to students)</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/alumni/referrals")}
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
