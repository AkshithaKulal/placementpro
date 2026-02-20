import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { getOrCreateAlumniProfile, AlumniProfileError } from "@/lib/alumni"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ALUMNI) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const alumniProfile = await getOrCreateAlumniProfile(session.user.id)

    const referral = await prisma.jobReferral.findFirst({
      where: {
        id: params.id,
        alumniId: alumniProfile.id,
      },
    })

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 })
    }

    return NextResponse.json(referral)
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ALUMNI) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const alumniProfile = await getOrCreateAlumniProfile(session.user.id)

    const existing = await prisma.jobReferral.findFirst({
      where: {
        id: params.id,
        alumniId: alumniProfile.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 })
    }

    const body = await req.json()
    const { company, position, description, requirements, link, isActive } = body

    const referral = await prisma.jobReferral.update({
      where: { id: params.id },
      data: {
        ...(company !== undefined && { company }),
        ...(position !== undefined && { position }),
        ...(description !== undefined && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(link !== undefined && { link }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(referral)
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
