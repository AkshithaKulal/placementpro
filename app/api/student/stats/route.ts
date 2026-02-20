import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

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

    // Get eligible drives count
    const allDrives = await prisma.placementDrive.findMany({
      where: { status: "ACTIVE" },
    })

    const eligibleDrives = allDrives.filter((drive) => {
      if (studentProfile.CGPA < drive.minCGPA) return false
      if (studentProfile.backlogs > drive.maxBacklogs) return false
      if (
        drive.eligibleBranches.length > 0 &&
        !drive.eligibleBranches.includes(studentProfile.branch)
      ) {
        return false
      }
      return true
    }).length

    // Get application stats
    const applications = await prisma.application.findMany({
      where: { studentId: studentProfile.id },
    })

    const shortlisted = applications.filter(
      (app) => app.status === "SHORTLISTED"
    ).length
    const selected = applications.filter((app) => app.status === "SELECTED").length

    return NextResponse.json({
      eligibleDrives,
      applications: applications.length,
      shortlisted,
      selected,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
