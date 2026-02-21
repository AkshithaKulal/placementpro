import { NextResponse } from "next/server"
import { requireTPO, tpoAccessDeniedResponse } from "@/lib/middleware/tpoAuth"
import { prisma } from "@/lib/prisma"
import { DriveStatus } from "@prisma/client"
import { notifyEligibleStudentsForDrive } from "@/lib/notifications"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireTPO()
    if (!session) return tpoAccessDeniedResponse()

    const drive = await prisma.placementDrive.findUnique({
      where: { id: params.id },
    })

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 })
    }

    return NextResponse.json(drive)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the current drive to check status change
    const currentDrive = await prisma.placementDrive.findUnique({
      where: { id: params.id },
    })

    if (!currentDrive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 })
    }

    // Update the drive
    const drive = await prisma.placementDrive.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(company && { company }),
        ...(status && Object.values(DriveStatus).includes(status) && { status }),
        ...(minCGPA !== undefined && { minCGPA: parseFloat(minCGPA) }),
        ...(maxBacklogs !== undefined && { maxBacklogs: parseInt(maxBacklogs) || 0 }),
        ...(eligibleBranches !== undefined && { eligibleBranches }),
        ...(requiredSkills !== undefined && { requiredSkills }),
        ...(location !== undefined && { location }),
        ...(pkg !== undefined && { package: pkg }),
        ...(registrationDeadline !== undefined && {
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        }),
      },
    })

    // If drive status changed to ACTIVE (from DRAFT or CLOSED), notify eligible students
    const statusChangedToActive =
      drive.status === "ACTIVE" && currentDrive.status !== "ACTIVE"

    if (statusChangedToActive) {
      // Run notification asynchronously (don't wait for it)
      notifyEligibleStudentsForDrive(drive.id).catch((error) => {
        console.error("Failed to send notifications:", error)
      })
    }

    return NextResponse.json(drive)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
