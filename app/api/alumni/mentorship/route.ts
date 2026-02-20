import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { getOrCreateAlumniProfile, AlumniProfileError } from "@/lib/alumni"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ALUMNI) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const alumniProfile = await getOrCreateAlumniProfile(session.user.id)

    const slots = await prisma.mentorshipSlot.findMany({
      where: { alumniId: alumniProfile.id },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(slots)
  } catch (error: any) {
    if (error instanceof AlumniProfileError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ALUMNI) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const alumniProfile = await getOrCreateAlumniProfile(session.user.id)

    const body = await req.json()
    const { date, startTime, endTime, topic } = body

    const slot = await prisma.mentorshipSlot.create({
      data: {
        alumniId: alumniProfile.id,
        date: new Date(date),
        startTime,
        endTime,
        topic,
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error: any) {
    if (error instanceof AlumniProfileError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
