import { prisma } from "@/lib/prisma"

function slotsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2
}

export async function checkAssignmentConflict(
  driveId: string,
  studentId: string,
  slotStart: Date,
  slotEnd: Date,
  excludeAssignmentId?: string
): Promise<boolean> {
  const existing = await prisma.interviewAssignment.findMany({
    where: { studentId },
    include: {
      slot: {
        select: { driveId: true, startTime: true, endTime: true },
      },
    },
  })

  for (const a of existing) {
    if (a.slot.driveId !== driveId) continue
    if (excludeAssignmentId && a.id === excludeAssignmentId) continue
    if (slotsOverlap(a.slot.startTime, a.slot.endTime, slotStart, slotEnd)) {
      return true
    }
  }
  return false
}

export async function assignStudentToSlot(
  slotId: string,
  studentId: string,
  panelName?: string
): Promise<{ success: true } | { success: false; error: string }> {
  const slot = await prisma.interviewSlot.findUnique({
    where: { id: slotId },
    include: { _count: { select: { assignments: true } } },
  })
  if (!slot) {
    return { success: false, error: "Slot not found" }
  }
  if (slot._count.assignments >= slot.maxStudents) {
    return { success: false, error: "Slot is full" }
  }

  const conflict = await checkAssignmentConflict(
    slot.driveId,
    studentId,
    slot.startTime,
    slot.endTime
  )
  if (conflict) {
    return { success: false, error: "Student already has an overlapping interview in this drive" }
  }

  await prisma.$transaction([
    prisma.interviewAssignment.create({
      data: { slotId, studentId, panelName },
    }),
    prisma.interviewSlot.update({
      where: { id: slotId },
      data: { currentCount: { increment: 1 } },
    }),
  ])
  return { success: true }
}

export async function unassignStudentFromSlot(assignmentId: string) {
  const a = await prisma.interviewAssignment.findUnique({
    where: { id: assignmentId },
  })
  if (!a) return
  await prisma.$transaction([
    prisma.interviewAssignment.delete({ where: { id: assignmentId } }),
    prisma.interviewSlot.update({
      where: { id: a.slotId },
      data: { currentCount: { decrement: 1 } },
    }),
  ])
}
