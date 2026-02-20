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

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    const applications = await prisma.application.findMany({
      where: { studentId: studentProfile.id },
      include: {
        drive: {
          select: {
            id: true,
            title: true,
            company: true,
            status: true,
            package: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    })

    return NextResponse.json(applications)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { driveId } = body

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
    })

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 })
    }

    if (drive.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Drive is not active" },
        { status: 400 }
      )
    }

    // Check eligibility
    if (
      studentProfile.CGPA < drive.minCGPA ||
      studentProfile.backlogs > drive.maxBacklogs ||
      (drive.eligibleBranches.length > 0 &&
        !drive.eligibleBranches.includes(studentProfile.branch))
    ) {
      return NextResponse.json(
        { error: "You are not eligible for this drive" },
        { status: 400 }
      )
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        studentId_driveId: {
          studentId: studentProfile.id,
          driveId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this drive" },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        studentId: studentProfile.id,
        driveId,
        status: "PENDING",
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already applied to this drive" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
