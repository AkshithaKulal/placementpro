import { NextResponse } from "next/server"
import { requireTPO } from "@/lib/middleware/tpoAuth"
import { unassignStudentFromSlot } from "@/lib/services/interviewSchedule"

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await requireTPO()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await unassignStudentFromSlot(params.assignmentId)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
