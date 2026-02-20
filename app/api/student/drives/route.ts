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

    const drives = await prisma.placementDrive.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    })

    const applications = await prisma.application.findMany({
      where: { studentId: studentProfile.id },
      select: { driveId: true },
    })

    const appliedDriveIds = new Set(applications.map((app) => app.driveId))

    const drivesWithEligibility = drives.map((drive) => {
      const isEligible =
        studentProfile.CGPA >= drive.minCGPA &&
        studentProfile.backlogs <= drive.maxBacklogs &&
        (drive.eligibleBranches.length === 0 ||
          drive.eligibleBranches.includes(studentProfile.branch))

      return {
        ...drive,
        isEligible,
        hasApplied: appliedDriveIds.has(drive.id),
      }
    })

    return NextResponse.json(drivesWithEligibility)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
