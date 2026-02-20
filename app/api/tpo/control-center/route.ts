import { NextResponse } from "next/server"
import { requireTPO } from "@/lib/middleware/tpoAuth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await requireTPO()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      students,
      drives,
      activeDrives,
      recentApplications,
    ] = await Promise.all([
      prisma.studentProfile.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { enrollmentNo: "asc" },
      }),
      prisma.placementDrive.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      }),
      prisma.placementDrive.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      }),
      prisma.application.findMany({
        take: 20,
        orderBy: { appliedAt: "desc" },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          drive: { select: { title: true, company: true } },
        },
      }),
    ])

    const companies = Array.from(
      new Set(drives.map((d) => d.company).filter(Boolean))
    ).sort()

    const totalStudents = students.length
    const totalDrives = drives.length
    const totalCompanies = companies.length

    const studentsList = students.map((s) => ({
      id: s.id,
      name: s.user.name || s.user.email,
      email: s.user.email,
      enrollmentNo: s.enrollmentNo,
      branch: s.branch,
      year: s.year,
      CGPA: s.CGPA,
    }))

    const recentApplied = recentApplications.map((a) => ({
      id: a.id,
      studentName: a.student.user.name || a.student.user.email,
      studentEmail: a.student.user.email,
      driveTitle: a.drive.title,
      driveCompany: a.drive.company,
      status: a.status,
      appliedAt: a.appliedAt,
    }))

    return NextResponse.json({
      totalStudents,
      totalCompanies,
      totalDrives,
      students: studentsList,
      companies,
      drives: drives.map((d) => ({
        id: d.id,
        title: d.title,
        company: d.company,
        status: d.status,
        _count: d._count,
        createdAt: d.createdAt,
      })),
      activeDrives: activeDrives.map((d) => ({
        id: d.id,
        title: d.title,
        company: d.company,
        status: d.status,
        _count: d._count,
        createdAt: d.createdAt,
      })),
      recentApplied,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
