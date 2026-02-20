import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

type Category = "eligibility" | "status" | "skill_gap" | "general"

function classifyIntent(text: string): Category {
  const normalized = text.toLowerCase().trim()
  const words = normalized.split(/\s+/)

  // General/preparation queries - check FIRST (avoid "interview" matching status)
  const generalKeywords = [
    "how to prepare", "prepare for interview", "prepare for interviews",
    "interview tip", "interview tips", "resume tip", "resume tips",
    "placement tip", "placement tips", "aptitude preparation",
    "technical preparation", "interview strategy", "general", "advice", "guidance",
  ]
  const eligibilityKeywords = [
    "eligible", "eligibility", "can i apply", "why can't i see", "why cant i see",
    "qualify", "qualification", "am i eligible", "current drives", "which drive",
    "see drive", "for tcs", "for google", "for microsoft", "for company",
  ]
  const statusKeywords = [
    "application status", "my status", "shortlist", "shortlisted", "cleared",
    "aptitude", "selected", "rejected", "pending", "have i been",
    "did i clear", "application result", "my application",
  ]
  const skillGapKeywords = [
    "improve", "improvement", "missing skill", "what should i", "how can i get placed",
    "get placed", "skills i need", "skill gap", "weak", "lack",
  ]

  const check = (keywords: string[]) =>
    keywords.some((k) => normalized.includes(k) || words.some((w) => w.includes(k) || k.includes(w)))

  if (check(generalKeywords)) return "general"
  if (check(eligibilityKeywords)) return "eligibility"
  if (check(statusKeywords)) return "status"
  if (check(skillGapKeywords)) return "skill_gap"

  return "general"
}

async function handleEligibility(
  studentProfile: { id: string; CGPA: number; backlogs: number; branch: string },
  _query: string
): Promise<string> {
  const drives = await prisma.placementDrive.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      company: true,
      minCGPA: true,
      maxBacklogs: true,
      eligibleBranches: true,
    },
  })

  if (drives.length === 0) {
    return `You have CGPA ${studentProfile.CGPA} and ${studentProfile.backlogs} backlogs (Branch: ${studentProfile.branch}). There are no active placement drives at the moment. Check back later for new drives.`
  }

  const eligible: string[] = []
  const notEligible: string[] = []

  for (const drive of drives) {
    const cgpaOk = studentProfile.CGPA >= drive.minCGPA
    const backlogsOk = studentProfile.backlogs <= drive.maxBacklogs
    const branchOk =
      drive.eligibleBranches.length === 0 ||
      drive.eligibleBranches.map((b) => b.toLowerCase()).includes(studentProfile.branch.toLowerCase())

    const branchesText = drive.eligibleBranches.length > 0 ? drive.eligibleBranches.join(", ") : "All"

    if (cgpaOk && backlogsOk && branchOk) {
      eligible.push(
        `• ${drive.title} (${drive.company})\n  Your CGPA ${studentProfile.CGPA} ✓ | Backlogs ${studentProfile.backlogs} ✓ | Branch ${studentProfile.branch} ✓`
      )
    } else {
      const reasons: string[] = []
      if (!cgpaOk) reasons.push(`CGPA ${studentProfile.CGPA} < ${drive.minCGPA}`)
      if (!backlogsOk) reasons.push(`Backlogs ${studentProfile.backlogs} > ${drive.maxBacklogs}`)
      if (!branchOk) reasons.push(`Branch ${studentProfile.branch} not in (${branchesText})`)
      notEligible.push(
        `• ${drive.title} (${drive.company})\n  Reason: ${reasons.join("; ")}`
      )
    }
  }

  const lines: string[] = []
  lines.push(`Your profile: CGPA ${studentProfile.CGPA} | Backlogs ${studentProfile.backlogs} | Branch ${studentProfile.branch}\n`)

  if (eligible.length > 0) {
    lines.push("ELIGIBLE DRIVES:")
    lines.push(eligible.join("\n\n"))
  }
  if (notEligible.length > 0) {
    lines.push("\nNOT ELIGIBLE:")
    lines.push(notEligible.join("\n\n"))
  }

  return lines.join("\n")
}

async function handleApplicationStatus(
  studentId: string,
  _query: string
): Promise<string> {
  const applications = await prisma.application.findMany({
    where: { studentId },
    include: {
      drive: { select: { title: true, company: true } },
    },
    orderBy: { appliedAt: "desc" },
  })

  if (applications.length === 0) {
    return "You have not applied to any placement drives yet. Browse active drives and apply to see your application status here."
  }

  const assignments = await prisma.interviewAssignment.findMany({
    where: { studentId },
    include: {
      slot: { select: { startTime: true, endTime: true, driveId: true } },
    },
  })

  const lines: string[] = []
  lines.push("YOUR APPLICATIONS:\n")
  for (const app of applications) {
    const slot = assignments.find((a) => a.slot.driveId === app.driveId)
    const interviewInfo = slot
      ? `\n  Interview: ${slot.slot.startTime.toLocaleDateString()} ${slot.slot.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${slot.slot.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : ""
    lines.push(`• ${app.drive.title} (${app.drive.company})\n  Status: ${app.status}${interviewInfo}`)
  }
  return lines.join("\n\n")
}

async function handleSkillGap(
  studentProfile: { skills: string[] },
  _query: string
): Promise<string> {
  const selected = await prisma.application.findMany({
    where: { status: "SELECTED" },
    include: {
      student: { select: { skills: true } },
    },
  })

  if (selected.length === 0) {
    return "There are no placed students in the system yet. Focus on building a strong profile: technical skills, aptitude, and communication. Keep an eye on drive requirements and align your skills accordingly."
  }

  const skillCount: Record<string, number> = {}
  for (const app of selected) {
    const skills = app.student.skills || []
    for (const s of skills) {
      const key = s.toLowerCase().trim()
      if (key) skillCount[key] = (skillCount[key] || 0) + 1
    }
  }

  const sorted = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill)

  const mySkills = new Set((studentProfile.skills || []).map((s) => s.toLowerCase().trim()))
  const missing = sorted.filter((s) => !mySkills.has(s)).slice(0, 3)

  if (missing.length === 0) {
    return "Your skills overlap well with what placed students have. Keep strengthening them and focus on aptitude, communication, and interview practice to improve your placement chances."
  }

  const skillList = missing.filter(Boolean).map((s, i) => `${i + 1}. ${s}`).join("\n")
  return `SKILL GAP ANALYSIS (based on placed students)\n\nTop skills to add or strengthen:\n\n${skillList}\n\nFocus on these along with aptitude and interview preparation to improve your placement chances.`
}

function handleGeneral(_query: string): string {
  return `PLACEMENT PREPARATION GUIDE

1. TECHNICAL PREPARATION
   • Revise core CS fundamentals (DSA, DBMS, OS, networks)
   • Practice coding on LeetCode or CodeChef
   • Be ready to explain projects and technologies on your resume

2. APTITUDE PREPARATION
   • Practice quantitative aptitude, logical reasoning, verbal ability
   • Use standard placement preparation resources and mock tests
   • Manage time well in timed tests

3. RESUME IMPROVEMENT
   • Keep resume to 1 page with clear sections (Education, Skills, Projects)
   • Use action verbs and quantify achievements
   • Tailor it to the role and company when applying

4. INTERVIEW STRATEGY
   • Research the company and role before the interview
   • Prepare short introductions and common HR/technical questions
   • Practice mock interviews and clear communication`
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!studentProfile) {
      const category = classifyIntent(message)
      const fallbackMessage =
        "I need your profile details to answer that. Please complete your student profile first (Dashboard → Profile), then ask again. For general tips, try: \"How to prepare for interviews?\" or \"Resume tips?\""
      return NextResponse.json({
        message: fallbackMessage,
        category,
        response: fallbackMessage,
      })
    }

    const category = classifyIntent(message)
    let responseMessage: string

    switch (category) {
      case "eligibility":
        responseMessage = await handleEligibility(studentProfile, message)
        break
      case "status":
        responseMessage = await handleApplicationStatus(studentProfile.id, message)
        break
      case "skill_gap":
        responseMessage = await handleSkillGap(studentProfile, message)
        break
      case "general":
      default:
        responseMessage = handleGeneral(message)
        break
    }

    return NextResponse.json({
      message: responseMessage,
      category,
      response: responseMessage,
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { error: err },
      { status: 500 }
    )
  }
}
