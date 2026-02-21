import { NextResponse } from "next/server"
import { requireTPO, tpoAccessDeniedResponse } from "@/lib/middleware/tpoAuth"
import { assignStudentToSlot } from "@/lib/services/interviewSchedule"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireTPO()
    if (!session) return tpoAccessDeniedResponse()

    const body = await req.json()
    const { slotId, studentId, panelName } = body
    if (!slotId || !studentId) {
      return NextResponse.json(
        { error: "slotId and studentId are required" },
        { status: 400 }
      )
    }

    const result = await assignStudentToSlot(slotId, studentId, panelName)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
