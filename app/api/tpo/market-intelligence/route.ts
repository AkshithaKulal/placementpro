import { NextResponse } from "next/server"
import { requireTPO, tpoAccessDeniedResponse } from "@/lib/middleware/tpoAuth"
import { prisma } from "@/lib/prisma"
import { ApplicationStatus } from "@prisma/client"

/**
 * Extract role from drive title (e.g., "Software Engineer" from "Software Engineer at Google")
 */
function extractRoleFromTitle(title: string): string {
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

export async function GET() {
  try {
    const session = await requireTPO()
    if (!session) return tpoAccessDeniedResponse()

    // Get all SELECTED applications (placed students)
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

    const totalPlacedStudents = selectedApplications.length

    // Calculate top skills frequency
    const skillCounts: Record<string, number> = {}
    selectedApplications.forEach((app) => {
      app.student.skills.forEach((skill) => {
        const normalizedSkill = skill.trim()
        if (normalizedSkill) {
          skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1
        }
      })
    })

    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: totalPlacedStudents > 0 
          ? Math.round((count / totalPlacedStudents) * 100) 
          : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate most hired job roles
    const roleCounts: Record<string, number> = {}
    selectedApplications.forEach((app) => {
      const role = extractRoleFromTitle(app.drive.title)
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })

    const mostHiredRoles = Object.entries(roleCounts)
      .map(([role, count]) => ({
        role,
        count,
        percentage: totalPlacedStudents > 0
          ? Math.round((count / totalPlacedStudents) * 100)
          : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      totalPlacedStudents,
      topSkills,
      mostHiredRoles,
    })
  } catch (error: any) {
    console.error("Error in market intelligence:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
