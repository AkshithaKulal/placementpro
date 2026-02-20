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

    const referrals = await prisma.jobReferral.findMany({
      where: { alumniId: alumniProfile.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(referrals)
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
    const { company, position, description, requirements, link, isActive } = body

    const referral = await prisma.jobReferral.create({
      data: {
        alumniId: alumniProfile.id,
        company,
        position,
        description,
        requirements: requirements || [],
        link,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(referral, { status: 201 })
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
