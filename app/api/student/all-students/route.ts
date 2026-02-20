import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const students = await prisma.studentProfile.findMany({
      where: {
        userId: { not: session.user.id },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      select: {
        id: true,
        enrollmentNo: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    const formatted = students.map((s) => ({
      id: s.id,
      name: s.user.name,
      enrollmentNo: s.enrollmentNo,
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
