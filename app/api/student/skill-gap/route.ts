import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { selectedStudents } = body

    if (!Array.isArray(selectedStudents) || selectedStudents.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one student" },
        { status: 400 }
      )
    }

    const currentStudent = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { skills: true },
    })

    if (!currentStudent) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    const selectedProfiles = await prisma.studentProfile.findMany({
      where: { id: { in: selectedStudents } },
      select: { skills: true },
    })

    // Count skill frequency
    const skillFrequency: Record<string, number> = {}
    selectedProfiles.forEach((profile) => {
      profile.skills.forEach((skill) => {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1
      })
    })

    // Find missing skills
    const currentSkills = new Set(currentStudent.skills)
    const missingSkills = Object.keys(skillFrequency).filter(
      (skill) => !currentSkills.has(skill)
    )

    return NextResponse.json({
      selectedStudents,
      skillFrequency,
      currentStudentSkills: currentStudent.skills,
      missingSkills,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
