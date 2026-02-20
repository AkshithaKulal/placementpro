"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils"

interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  topic?: string
  isBooked: boolean
  bookedBy?: string
}

export default function MentorshipPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/alumni/mentorship")
      const data = await response.json()
      if (response.ok) {
        setSlots(data)
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mentorship Slots</h1>
          <p className="text-gray-600">Manage your mentorship availability</p>
        </div>
        <Link href="/dashboard/alumni/mentorship/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Slot
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : slots.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600 mb-4">No mentorship slots created yet</p>
            <Link href="/dashboard/alumni/mentorship/new">
              <Button>Create Your First Slot</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {slots.map((slot) => (
            <Card key={slot.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{formatDate(slot.date)}</CardTitle>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      slot.isBooked
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {slot.isBooked ? "Booked" : "Available"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Time:</span> {slot.startTime} - {slot.endTime}
                  </div>
                  {slot.topic && (
                    <div>
                      <span className="font-medium">Topic:</span> {slot.topic}
                    </div>
                  )}
                  {slot.isBooked && slot.bookedBy && (
                    <div>
                      <span className="font-medium">Booked by:</span> {slot.bookedBy}
                    </div>
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
