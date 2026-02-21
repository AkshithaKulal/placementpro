import { NextResponse } from "next/server"
import { requireTPO, tpoAccessDeniedResponse } from "@/lib/middleware/tpoAuth"
import { prisma } from "@/lib/prisma"
import { ApplicationStatus } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireTPO()
    if (!session) return tpoAccessDeniedResponse()

    const body = await req.json()
    const { status } = body

    if (!Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const application = await prisma.application.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json(application)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
