import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

/**
 * Eligibility-based company feed:
 * - Student CGPA >= drive minCGPA
 * - At least 50% of drive requiredSkills match student skills (or all if no requiredSkills)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    const drives = await prisma.placementDrive.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    })

    const applications = await prisma.application.findMany({
      where: { studentId: studentProfile.id },
      select: { driveId: true },
    })
    const appliedDriveIds = new Set(applications.map((a) => a.driveId))

    const studentSkillsLower = new Set(
      studentProfile.skills.map((s) => s.trim().toLowerCase()).filter(Boolean)
    )

    const feed = drives
      .filter((drive) => {
        if (studentProfile.CGPA < drive.minCGPA) return false
        if (studentProfile.backlogs > drive.maxBacklogs) return false
        if (
          drive.eligibleBranches.length > 0 &&
          !drive.eligibleBranches.includes(studentProfile.branch)
        ) {
          return false
        }
        // 50% skill match: if drive has requiredSkills, at least half must match
        const requiredSkills = drive.requiredSkills || []
        if (requiredSkills.length === 0) return true
        const matchCount = requiredSkills.filter((s) =>
          studentSkillsLower.has(s.trim().toLowerCase())
        ).length
        return matchCount >= Math.ceil(requiredSkills.length * 0.5)
      })
      .map((drive) => ({
        id: drive.id,
        role: drive.title,
        company: drive.company,
        package: drive.package,
        location: drive.location,
        description: drive.description,
        minCGPA: drive.minCGPA,
        hasApplied: appliedDriveIds.has(drive.id),
      }))

    return NextResponse.json(feed)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
