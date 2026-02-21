import { NextResponse } from "next/server"
import { requireTPO, tpoAccessDeniedResponse } from "@/lib/middleware/tpoAuth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await requireTPO()
    if (!session) return tpoAccessDeniedResponse()

    const students = await prisma.studentProfile.findMany({
      select: {
        id: true,
        enrollmentNo: true,
        branch: true,
        year: true,
        CGPA: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        enrollmentNo: "asc",
      },
    })

    const formatted = students.map((s) => ({
      id: s.id,
      name: s.user.name || s.user.email,
      email: s.user.email,
      enrollmentNo: s.enrollmentNo,
      branch: s.branch,
      year: s.year,
      CGPA: s.CGPA,
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
