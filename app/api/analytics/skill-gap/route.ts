import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole, ApplicationStatus } from "@prisma/client"

interface SkillFrequency {
  skill: string
  percentage: number
  count: number
}

interface SkillGapResponse {
  targetRole: string
  totalPlacedStudents: number
  topSkills: SkillFrequency[]
  missingSkills: string[]
  recommendation: string
  currentStudentSkills: string[]
}

/**
 * Extract role from drive title (e.g., "Software Engineer" from "Software Engineer at Google")
 * This is a simple heuristic - can be improved with NLP
 */
function extractRoleFromTitle(title: string): string {
  // Common patterns: "Role at Company", "Role - Company", "Role"
  const patterns = [
    /^([^a]+?)\s+(?:at|@|-|–)\s+/i, // "Role at Company"
    /^([^a]+?)\s*$/i, // Just "Role"
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

  // Exact match or contains target role
  return (
    normalizedExtracted === normalizedTarget ||
    normalizedExtracted.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedExtracted)
  )
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const targetRole = searchParams.get("targetRole")

    if (!targetRole) {
      return NextResponse.json(
        { error: "targetRole query parameter is required" },
        { status: 400 }
      )
    }

    // Get current student profile
    const currentStudent = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { skills: true },
    })

    if (!currentStudent) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    // Get all SELECTED applications (placed students)
    const selectedApplications = await prisma.application.findMany({
      where: {
        status: ApplicationStatus.SELECTED,
      },
      include: {
        drive: {
          select: {
            title: true,
            company: true,
          },
        },
        student: {
          select: {
            skills: true,
          },
        },
      },
    })

    // Filter by target role
    const roleMatchedApplications = selectedApplications.filter((app) =>
      matchesTargetRole(app.drive.title, targetRole)
    )

    if (roleMatchedApplications.length === 0) {
      return NextResponse.json({
        targetRole,
        totalPlacedStudents: 0,
        topSkills: [],
        missingSkills: [],
        recommendation: `No placement data found for "${targetRole}" roles. Try a different role or check back later.`,
        currentStudentSkills: currentStudent.skills,
      })
    }

    // Extract all skills from placed students
    const skillCounts: Record<string, number> = {}
    const totalPlacedStudents = roleMatchedApplications.length

    roleMatchedApplications.forEach((app) => {
      app.student.skills.forEach((skill) => {
        const normalizedSkill = skill.trim()
        if (normalizedSkill) {
          skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1
        }
      })
    })

    // Calculate percentages and filter by minimum threshold (30%)
    const skillFrequencies: SkillFrequency[] = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / totalPlacedStudents) * 100),
      }))
      .filter((item) => item.percentage >= 30) // Only skills with >= 30% frequency
      .sort((a, b) => b.percentage - a.percentage) // Sort by percentage descending
      .slice(0, 5) // Top 5 skills

    // Find missing skills
    const currentSkillsSet = new Set(
      currentStudent.skills.map((s) => s.trim().toLowerCase())
    )
    const missingSkills = skillFrequencies
      .filter((item) => !currentSkillsSet.has(item.skill.trim().toLowerCase()))
      .map((item) => item.skill)

    // Generate recommendation
    let recommendation = ""
    if (missingSkills.length === 0) {
      recommendation = `Great! You have all the top skills required for ${targetRole} roles. Keep building on your expertise.`
    } else {
      const topMissingSkill = missingSkills[0]
      const topMissingSkillData = skillFrequencies.find(
        (s) => s.skill === topMissingSkill
      )
      if (topMissingSkillData) {
        recommendation = `You are targeting ${targetRole} roles. ${topMissingSkillData.percentage}% of placed students had ${topMissingSkill} in their skills. You are missing this skill. Recommended Action: Complete a ${topMissingSkill} certification course or build projects using ${topMissingSkill}.`
      } else {
        recommendation = `Focus on developing these missing skills: ${missingSkills.join(", ")}. These are highly valued by employers for ${targetRole} positions.`
      }
    }

    const response: SkillGapResponse = {
      targetRole,
      totalPlacedStudents,
      topSkills: skillFrequencies,
      missingSkills,
      recommendation,
      currentStudentSkills: currentStudent.skills,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error in skill gap analysis:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
