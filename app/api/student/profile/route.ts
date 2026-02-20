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

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        enrollmentNo: true,
        branch: true,
        year: true,
        CGPA: true,
        backlogs: true,
        skills: true,
        phone: true,
        address: true,
        linkedin: true,
        github: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      enrollmentNo,
      branch,
      year,
      CGPA,
      backlogs,
      skills,
      phone,
      address,
      linkedin,
      github,
    } = body

    const profile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        enrollmentNo,
        branch,
        year: parseInt(year),
        CGPA: parseFloat(CGPA),
        backlogs: parseInt(backlogs) || 0,
        skills: skills || [],
        phone,
        address,
        linkedin,
        github,
      },
      create: {
        userId: session.user.id,
        enrollmentNo,
        branch,
        year: parseInt(year),
        CGPA: parseFloat(CGPA),
        backlogs: parseInt(backlogs) || 0,
        skills: skills || [],
        phone,
        address,
        linkedin,
        github,
      },
    })

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
