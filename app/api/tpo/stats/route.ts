import { NextResponse } from "next/server"
import { requireTPO, tpoAccessDeniedResponse } from "@/lib/middleware/tpoAuth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await requireTPO()
    if (!session) return tpoAccessDeniedResponse()

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
