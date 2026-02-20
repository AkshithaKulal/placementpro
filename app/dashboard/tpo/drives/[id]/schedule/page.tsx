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
import { useToast } from "@/components/ui/use-toast"
import { formatDateTime, formatDate } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Trash2, Calendar, Clock } from "lucide-react"

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
  const { toast } = useToast()
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
        refreshSlots()
        toast({ title: "Assigned", description: "Student assigned to slot successfully" })
      } else {
        toast({ title: "Error", description: data.error || "Failed to assign", variant: "destructive" })
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
    if (res.ok) {
      refreshSlots()
      toast({ title: "Unassigned", description: "Student removed from slot" })
    }
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
        toast({ title: "Slot created", description: "New interview slot added" })
      } else {
        const d = await res.json()
        toast({ title: "Error", description: d.error || "Failed to create slot", variant: "destructive" })
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
          <span className="text-muted-foreground">Loading schedule...</span>
        </motion.div>
      </div>
    )
  }

  if (!drive) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Drive not found</p>
        <Link href="/dashboard/tpo/drives">
          <Button variant="outline" className="rounded-xl">Back to Drives</Button>
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/tpo/drives/${driveId}`}>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-50/50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Interview Schedule
          </h1>
          <p className="text-muted-foreground">
            {drive.title} · {drive.company}
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
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
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input
              type="datetime-local"
              value={newSlotEnd}
              onChange={(e) => setNewSlotEnd(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Button
            onClick={handleCreateSlot}
            disabled={creatingSlot}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
          >
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
          className="max-w-xs rounded-xl"
        />
      </div>

      <div className="space-y-6">
        {Object.keys(slotsByDate).length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-12 text-center text-muted-foreground">
              No slots yet. Add a time slot above.
            </CardContent>
          </Card>
        ) : (
          Object.entries(slotsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateSlots], dateIdx) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIdx * 0.05 }}
              >
                <Card className="rounded-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      {date}
                    </CardTitle>
                    <CardDescription>Time slots and assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {dateSlots.map((slot, slotIdx) => {
                        const isFull = slot._count.assignments >= slot.maxStudents
                        const hasAssignments = slot.assignments.length > 0
                        return (
                          <motion.div
                            key={slot.id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: slotIdx * 0.03 }}
                            title={
                              isFull
                                ? "Slot is full"
                                : hasAssignments
                                ? `${slot._count.assignments}/${slot.maxStudents} assigned`
                                : "Available slot"
                            }
                            className={`rounded-2xl border-2 p-4 space-y-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${
                              isFull
                                ? "border-emerald-200 bg-emerald-50/50"
                                : hasAssignments
                                ? "border-indigo-200 bg-indigo-50/30"
                                : "border-dashed border-muted-foreground/30 bg-muted/20 hover:border-indigo-200 hover:bg-indigo-50/20"
                            }`}
                          >
                            <div className="font-semibold text-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              {formatDateTime(slot.startTime)} – {formatDateTime(slot.endTime)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {slot._count.assignments} / {slot.maxStudents} assigned
                            </div>
                            <ul className="space-y-2">
                              {slot.assignments.map((a) => (
                                <li
                                  key={a.id}
                                  className="flex items-center justify-between text-sm gap-2 p-2 rounded-xl bg-white/80"
                                >
                                  <span>
                                    {a.student.user.name || a.student.user.email}
                                    {a.panelName && (
                                      <span className="text-muted-foreground ml-1">({a.panelName})</span>
                                    )}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                                    onClick={() => handleUnassign(a.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                            {!isFull && (
                              <div className="flex gap-2 items-center flex-wrap pt-1">
                                <Select
                                  onValueChange={(studentId) => {
                                    if (studentId) handleAssign(slot.id, studentId)
                                  }}
                                  disabled={assigning === slot.id || eligibleStudents.length === 0}
                                >
                                  <SelectTrigger className="w-full rounded-xl border-2">
                                    <SelectValue placeholder="Assign student" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {eligibleStudents
                                      .filter((s) => !slot.assignments.some((a) => a.student.id === s.id))
                                      .map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                          {s.name} ({s.email})
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                {assigning === slot.id && (
                                  <span className="text-xs text-muted-foreground">Assigning…</span>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/tpo/drives/${driveId}`)}
          className="rounded-xl"
        >
          Back to Drive
        </Button>
        <Link href="/dashboard/tpo/drives">
          <Button variant="outline" className="rounded-xl">All Drives</Button>
        </Link>
      </div>
    </motion.div>
  )
}
