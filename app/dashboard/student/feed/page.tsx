"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, MapPin, DollarSign } from "lucide-react"

interface FeedItem {
  id: string
  role: string
  company: string
  package?: string
  location?: string
  description?: string
  minCGPA: number
  hasApplied: boolean
}

export default function FeedPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const response = await fetch("/api/student/feed")
      const data = await response.json()
      if (response.ok) {
        setItems(data)
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error)
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
        title: "Applied",
        description: "Application submitted successfully.",
      })
      fetchFeed()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading feed...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Feed</h1>
        <p className="text-gray-600">
          Companies matching your eligibility (CGPA & 50%+ skills match)
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No eligible companies right now.</p>
            <p className="text-sm text-gray-500 mt-2">
              Update your profile or skills to see more opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{item.role}</CardTitle>
                    <CardDescription>{item.company}</CardDescription>
                  </div>
                  {item.hasApplied ? (
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Applied
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApply(item.id)}
                      disabled={item.hasApplied}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 text-sm text-gray-600">
                {item.package && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {item.package}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {item.location}
                  </span>
                )}
                <span>Min CGPA: {item.minCGPA}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
