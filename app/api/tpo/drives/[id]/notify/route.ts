import { NextResponse } from "next/server"
import { requireTPO } from "@/lib/middleware/tpoAuth"
import { notifyEligibleStudentsForDrive } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireTPO()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const drive = await prisma.placementDrive.findUnique({
      where: { id: params.id },
    })
    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 })
    }
    if (drive.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only active drives can send notifications" },
        { status: 400 }
      )
    }

    const result = await notifyEligibleStudentsForDrive(params.id)
    return NextResponse.json({
      success: true,
      notified: result.notified,
      emailsSent: result.emailsSent,
      errors: result.errors,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
