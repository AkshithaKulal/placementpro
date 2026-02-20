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

    const [totalDrives, activeDrives, totalApplications, totalStudents] = await Promise.all([
      prisma.placementDrive.count(),
      prisma.placementDrive.count({ where: { status: "ACTIVE" } }),
      prisma.application.count(),
      prisma.studentProfile.count(),
    ])

    return NextResponse.json({
      totalDrives,
      activeDrives,
      totalApplications,
      totalStudents,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
