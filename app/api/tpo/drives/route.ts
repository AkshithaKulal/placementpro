import { NextResponse } from "next/server"
import { requireTPO, tpoAccessDeniedResponse } from "@/lib/middleware/tpoAuth"
import { prisma } from "@/lib/prisma"
import { notifyEligibleStudentsForDrive } from "@/lib/notifications"

export async function GET() {
  try {
    const session = await requireTPO()
    if (!session) return tpoAccessDeniedResponse()

    const drives = await prisma.placementDrive.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    })

    return NextResponse.json(drives)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireTPO()
    if (!session) return tpoAccessDeniedResponse()

    const body = await req.json()
    const {
      title,
      description,
      company,
      status,
      minCGPA,
      maxBacklogs,
      eligibleBranches,
      requiredSkills,
      location,
      package: pkg,
      registrationDeadline,
    } = body

    const drive = await prisma.placementDrive.create({
      data: {
        title,
        description,
        company,
        status: status || "DRAFT",
        minCGPA: parseFloat(minCGPA),
        maxBacklogs: parseInt(maxBacklogs) || 0,
        eligibleBranches: eligibleBranches || [],
        requiredSkills: requiredSkills || [],
        location,
        package: pkg,
        registrationDeadline: registrationDeadline
          ? new Date(registrationDeadline)
          : null,
      },
    })

    // If drive is created with ACTIVE status, notify eligible students
    if (drive.status === "ACTIVE") {
      // Run notification asynchronously (don't wait for it)
      notifyEligibleStudentsForDrive(drive.id).catch((error) => {
        console.error("Failed to send notifications:", error)
      })
    }

    return NextResponse.json(drive, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
