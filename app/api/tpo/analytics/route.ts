import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.TPO) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [drivesByStatus, applicationsByStatus, drives, students] = await Promise.all([
      prisma.placementDrive.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.application.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.placementDrive.findMany({
        select: { company: true },
      }),
      prisma.studentProfile.findMany({
        select: { CGPA: true },
      }),
    ])

    const drivesByStatusFormatted = drivesByStatus.map((item) => ({
      status: item.status,
      count: item._count,
    }))

    const applicationsByStatusFormatted = applicationsByStatus.map((item) => ({
      status: item.status,
      count: item._count,
    }))

    const companyCounts: Record<string, number> = {}
    drives.forEach((drive) => {
      companyCounts[drive.company] = (companyCounts[drive.company] || 0) + 1
    })

    const topCompanies = Object.entries(companyCounts)
      .map(([company, drives]) => ({ company, drives }))
      .sort((a, b) => b.drives - a.drives)
      .slice(0, 5)

    const averageCGPA =
      students.length > 0
        ? students.reduce((sum, s) => sum + s.CGPA, 0) / students.length
        : 0

    return NextResponse.json({
      drivesByStatus: drivesByStatusFormatted,
      applicationsByStatus: applicationsByStatusFormatted,
      topCompanies,
      averageCGPA,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
