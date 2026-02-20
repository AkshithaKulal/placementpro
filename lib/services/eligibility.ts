import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const SKILL_MATCH_THRESHOLD = 0.5 // 50%

function skillMatchRatio(required: string[], studentSkills: string[]): number {
  if (required.length === 0) return 1
  const requiredLower = required.map((s) => s.toLowerCase().trim())
  const studentLower = studentSkills.map((s) => s.toLowerCase().trim())
  const matched = requiredLower.filter((r) =>
    studentLower.some((s) => s.includes(r) || r.includes(s))
  ).length
  return matched / requiredLower.length
}

export type EligibleStudent = {
  id: string
  userId: string
  name: string
  email: string
  branch: string
  CGPA: number
  enrollmentNo: string
}

export async function getEligibleStudents(driveId: string): Promise<EligibleStudent[]> {
  const drive = await prisma.placementDrive.findUnique({
    where: { id: driveId },
  })
  if (!drive) return []

  const where: Prisma.StudentProfileWhereInput = {
    CGPA: { gte: drive.minCGPA },
    backlogs: { lte: drive.maxBacklogs },
  }
  if (drive.eligibleBranches.length > 0) {
    where.branch = { in: drive.eligibleBranches }
  }

  const students = await prisma.studentProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  const required = drive.requiredSkills || []
  const eligible = students.filter((s) => {
    const ratio = skillMatchRatio(required, s.skills || [])
    return ratio >= SKILL_MATCH_THRESHOLD
  })

  return eligible.map((s) => ({
    id: s.id,
    userId: s.user.id,
    name: s.user.name || s.user.email,
    email: s.user.email,
    branch: s.branch,
    CGPA: s.CGPA,
    enrollmentNo: s.enrollmentNo,
  }))
}

export async function getEligibleCount(driveId: string): Promise<number> {
  const list = await getEligibleStudents(driveId)
  return list.length
}
