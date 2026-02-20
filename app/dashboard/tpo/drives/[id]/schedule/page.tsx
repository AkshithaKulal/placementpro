"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateTime, formatDate } from "@/lib/utils"
import { ArrowLeft, Plus, Trash2, Calendar } from "lucide-react"

type Drive = { id: string; title: string; company: string }

type StudentOption = { id: string; name: string; email: string }

type Assignment = {
  id: string
  panelName: string | null
  student: {
    id: string
    user: { name: string | null; email: string }
  }
}

type Slot = {
  id: string
  startTime: string
  endTime: string
  maxStudents: number
  _count: { assignments: number }
  assignments: Assignment[]
}

export default function SchedulePage() {
  const params = useParams()
  const router = useRouter()
  const [drive, setDrive] = useState<Drive | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [eligibleStudents, setEligibleStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [newSlotStart, setNewSlotStart] = useState("")
  const [newSlotEnd, setNewSlotEnd] = useState("")
  const [panelName, setPanelName] = useState("")
  const [creatingSlot, setCreatingSlot] = useState(false)

  const driveId = params.id as string

  useEffect(() => {
    if (driveId) {
      Promise.all([
        fetch(`/api/tpo/drives/${driveId}`).then((r) => r.json()),
        fetch(`/api/tpo/drives/${driveId}/slots`).then((r) => r.json()),
        fetch(`/api/tpo/drives/${driveId}/eligible-students`).then((r) => r.json()),
      ]).then(([driveData, slotsData, eligibleData]) => {
        if (driveData.id) setDrive(driveData)
        if (Array.isArray(slotsData)) setSlots(slotsData)
        if (eligibleData.students) setEligibleStudents(eligibleData.students)
      }).finally(() => setLoading(false))
    }
  }, [driveId])

  const refreshSlots = () => {
    fetch(`/api/tpo/drives/${driveId}/slots`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setSlots(data))
  }

  const handleAssign = async (slotId: string, studentId: string) => {
    setAssigning(slotId)
    try {
      const res = await fetch(`/api/tpo/drives/${driveId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          studentId,
          panelName: panelName.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPanelName("")
        refreshSlots()
      } else {
        alert(data.error || "Failed to assign")
      }
    } finally {
      setAssigning(null)
    }
  }

  const handleUnassign = async (assignmentId: string) => {
    const res = await fetch(
      `/api/tpo/drives/${driveId}/assignments/${assignmentId}`,
      { method: "DELETE" }
    )
    if (res.ok) refreshSlots()
  }

  const handleCreateSlot = async () => {
    if (!newSlotStart || !newSlotEnd) return
    setCreatingSlot(true)
    try {
      const res = await fetch(`/api/tpo/drives/${driveId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date(newSlotStart).toISOString(),
          endTime: new Date(newSlotEnd).toISOString(),
          maxStudents: 1,
        }),
      })
      if (res.ok) {
        setNewSlotStart("")
        setNewSlotEnd("")
        refreshSlots()
      } else {
        const d = await res.json()
        alert(d.error || "Failed to create slot")
      }
    } finally {
      setCreatingSlot(false)
    }
  }

  const slotsByDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const d = formatDate(s.startTime)
    if (!acc[d]) acc[d] = []
    acc[d].push(s)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground">Loading schedule...</div>
      </div>
    )
  }

  if (!drive) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Drive not found</p>
        <Link href="/dashboard/tpo/drives">
          <Button variant="outline">Back to Drives</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/tpo/drives/${driveId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Interview Schedule</h1>
          <p className="text-muted-foreground">
            {drive.title} · {drive.company}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add Time Slot
          </CardTitle>
          <CardDescription>
            Create a new interview slot. Then assign students; overlapping assignments for the same student are blocked.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Start</Label>
            <Input
              type="datetime-local"
              value={newSlotStart}
              onChange={(e) => setNewSlotStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input
              type="datetime-local"
              value={newSlotEnd}
              onChange={(e) => setNewSlotEnd(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateSlot} disabled={creatingSlot}>
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label>Panel name (optional, used when assigning)</Label>
        <Input
          placeholder="e.g. Panel A"
          value={panelName}
          onChange={(e) => setPanelName(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-6">
        {Object.keys(slotsByDate).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No slots yet. Add a time slot above.
            </CardContent>
          </Card>
        ) : (
          Object.entries(slotsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateSlots]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle>{date}</CardTitle>
                  <CardDescription>Time slots and assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dateSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-lg border bg-card p-4 space-y-3"
                      >
                        <div className="font-medium text-sm">
                          {formatDateTime(slot.startTime)} – {formatDateTime(slot.endTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {slot._count.assignments} / {slot.maxStudents} assigned
                        </div>
                        <ul className="space-y-1">
                          {slot.assignments.map((a) => (
                            <li
                              key={a.id}
                              className="flex items-center justify-between text-sm gap-2"
                            >
                              <span>
                                {a.student.user.name || a.student.user.email}
                                {a.panelName && (
                                  <span className="text-muted-foreground ml-1">
                                    ({a.panelName})
                                  </span>
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleUnassign(a.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                        {slot._count.assignments < slot.maxStudents && (
                          <div className="flex gap-2 items-center flex-wrap">
                            <Select
                              onValueChange={(studentId) => {
                                if (studentId) handleAssign(slot.id, studentId)
                              }}
                              disabled={assigning === slot.id || eligibleStudents.length === 0}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Assign student" />
                              </SelectTrigger>
                              <SelectContent>
                                {eligibleStudents
                                  .filter(
                                    (s) =>
                                      !slot.assignments.some(
                                        (a) => a.student.id === s.id
                                      )
                                  )
                                  .map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name} ({s.email})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {assigning === slot.id && (
                              <span className="text-xs text-muted-foreground">
                                Assigning…
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push(`/dashboard/tpo/drives/${driveId}`)}>
          Back to Drive
        </Button>
        <Link href="/dashboard/tpo/drives">
          <Button variant="outline">All Drives</Button>
        </Link>
      </div>
    </div>
  )
}
