import { NextResponse } from "next/server"
import { requireTPO, tpoAccessDeniedResponse } from "@/lib/middleware/tpoAuth"
import { getEligibleStudents } from "@/lib/services/eligibility"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
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

    const students = await getEligibleStudents(params.id)
    return NextResponse.json({ eligibleCount: students.length, students })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
