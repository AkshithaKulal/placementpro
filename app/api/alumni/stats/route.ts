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

    const [jobReferrals, mentorshipSlots, bookedSlots] = await Promise.all([
      prisma.jobReferral.count({
        where: { alumniId: alumniProfile.id },
      }),
      prisma.mentorshipSlot.count({
        where: { alumniId: alumniProfile.id },
      }),
      prisma.mentorshipSlot.count({
        where: { alumniId: alumniProfile.id, isBooked: true },
      }),
    ])

    return NextResponse.json({
      jobReferrals,
      mentorshipSlots,
      bookedSlots,
    })
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
