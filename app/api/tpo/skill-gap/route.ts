import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole, ApplicationStatus } from "@prisma/client"

/**
 * Extract role from drive title
 */
function extractRoleFromTitle(title: string): string {
  const patterns = [
    /^([^a]+?)\s+(?:at|@|-|–)\s+/i,
    /^([^a]+?)\s*$/i,
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return title.trim()
}

/**
 * Check if a drive title matches the target role
 */
function matchesTargetRole(driveTitle: string, targetRole: string): boolean {
  const extractedRole = extractRoleFromTitle(driveTitle)
  const normalizedExtracted = extractedRole.toLowerCase()
  const normalizedTarget = targetRole.toLowerCase()

  return (
    normalizedExtracted === normalizedTarget ||
    normalizedExtracted.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedExtracted)
  )
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.TPO) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { studentId, role } = body

    if (!studentId && !role) {
      return NextResponse.json(
        { error: "Either studentId or role must be provided" },
        { status: 400 }
      )
    }

    // Get student profile
    let studentProfile
    if (studentId) {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      if (!studentProfile) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "studentId is required for skill gap analysis" },
        { status: 400 }
      )
    }

    // Get placed students data
    const selectedApplications = await prisma.application.findMany({
      where: {
        status: ApplicationStatus.SELECTED,
      },
      include: {
        student: {
          select: {
            skills: true,
          },
        },
        drive: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    })

    // Filter by role if provided
    let relevantApplications = selectedApplications
    let targetRole = role

    if (role) {
      relevantApplications = selectedApplications.filter((app) =>
        matchesTargetRole(app.drive.title, role)
      )
      targetRole = role
    } else {
      // If no role specified, use all placed students
      targetRole = "All Roles"
    }

    if (relevantApplications.length === 0) {
      return NextResponse.json({
        studentId: studentProfile.id,
        studentName: studentProfile.user.name || studentProfile.user.email,
        targetRole: targetRole || "All Roles",
        topSkills: [],
        missingSkills: [],
        gapScore: 0,
        recommendation: `No placement data found for ${targetRole || "selected criteria"}. Cannot perform skill gap analysis.`,
        totalPlacedStudents: 0,
      })
    }

    // Calculate skill frequency from placed students
    const skillCounts: Record<string, number> = {}
    const totalPlacedStudents = relevantApplications.length

    relevantApplications.forEach((app) => {
      app.student.skills.forEach((skill) => {
        const normalizedSkill = skill.trim()
        if (normalizedSkill) {
          skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1
        }
      })
    })

    // Get top 5 skills with >= 30% frequency
    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / totalPlacedStudents) * 100),
      }))
      .filter((item) => item.percentage >= 30)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)

    // Find missing skills
    const currentSkillsSet = new Set(
      studentProfile.skills.map((s) => s.trim().toLowerCase())
    )
    const missingSkills = topSkills
      .filter((item) => !currentSkillsSet.has(item.skill.trim().toLowerCase()))
      .map((item) => item.skill)

    // Calculate gap score (percentage of top skills the student has)
    const skillsMatched = topSkills.length - missingSkills.length
    const gapScore =
      topSkills.length > 0
        ? Math.round((skillsMatched / topSkills.length) * 100)
        : 0

    // Generate recommendation
    let recommendation = ""
    if (missingSkills.length === 0) {
      recommendation = `Excellent! ${studentProfile.user.name || "This student"} has all the top skills required for ${targetRole} roles. They are well-prepared for placement.`
    } else {
      const topMissingSkill = missingSkills[0]
      const topMissingSkillData = topSkills.find((s) => s.skill === topMissingSkill)
      if (topMissingSkillData) {
        recommendation = `${studentProfile.user.name || "This student"} is targeting ${targetRole} roles. ${topMissingSkillData.percentage}% of placed students had ${topMissingSkill} in their skills. This student does not have ${topMissingSkill}. Recommended Action: Focus on developing ${topMissingSkill} skills through courses, projects, or certifications.`
      } else {
        recommendation = `Focus on developing these missing skills: ${missingSkills.join(", ")}. These are highly valued by employers for ${targetRole} positions.`
      }
    }

    return NextResponse.json({
      studentId: studentProfile.id,
      studentName: studentProfile.user.name || studentProfile.user.email,
      targetRole: targetRole || "All Roles",
      topSkills,
      missingSkills,
      gapScore,
      recommendation,
      totalPlacedStudents,
      currentStudentSkills: studentProfile.skills,
    })
  } catch (error: any) {
    console.error("Error in skill gap analysis:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
