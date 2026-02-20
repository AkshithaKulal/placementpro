import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole, ApplicationStatus } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.TPO) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
