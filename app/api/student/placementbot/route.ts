import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

type Category = "eligibility" | "status" | "skill_gap" | "general"

function classifyIntent(text: string): Category {
  const normalized = text.toLowerCase().trim()
  const words = normalized.split(/\s+/)

  const eligibilityKeywords = [
    "eligible", "eligibility", "can i apply", "why can't i see", "why cant i see",
    "qualify", "qualification", "cgpa", "backlog", "branch", "drive", "see drive",
    "which drive", "for tcs", "for google", "for microsoft", "for company",
    "eligible for interview", "current drives",
  ]
  const statusKeywords = [
    "application status", "my status", "shortlist", "shortlisted", "cleared",
    "aptitude", "interview", "selected", "rejected", "pending", "have i been",
    "did i clear", "application result",
  ]
  const skillGapKeywords = [
    "improve", "improvement", "missing skill", "what should i", "how can i get placed",
    "get placed", "skills i need", "skill gap", "weak", "lack", "prepare skill",
  ]
  const generalKeywords = [
    "how to prepare", "interview tip", "resume tip", "placement tip", "prepare for interview",
    "aptitude preparation", "technical preparation", "interview strategy", "resume",
    "general", "advice", "guidance",
  ]

  const check = (keywords: string[]) =>
    keywords.some((k) => normalized.includes(k) || words.some((w) => w.includes(k) || k.includes(w)))

  if (check(eligibilityKeywords)) return "eligibility"
  if (check(statusKeywords)) return "status"
  if (check(skillGapKeywords)) return "skill_gap"
  if (check(generalKeywords)) return "general"

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

  const results: string[] = []
  for (const drive of drives) {
    const cgpaOk = studentProfile.CGPA >= drive.minCGPA
    const backlogsOk = studentProfile.backlogs <= drive.maxBacklogs
    const branchOk =
      drive.eligibleBranches.length === 0 ||
      drive.eligibleBranches.map((b) => b.toLowerCase()).includes(studentProfile.branch.toLowerCase())

    if (cgpaOk && backlogsOk && branchOk) {
      results.push(
        `**${drive.title} (${drive.company})**: You are eligible. Your CGPA (${studentProfile.CGPA}) meets the required minimum (${drive.minCGPA}), your backlogs (${studentProfile.backlogs}) are within the limit (${drive.maxBacklogs}), and your branch (${studentProfile.branch}) is in the eligible list.`
      )
    } else {
      const reasons: string[] = []
      if (!cgpaOk)
        reasons.push(`your CGPA (${studentProfile.CGPA}) is below the required minimum (${drive.minCGPA})`)
      if (!backlogsOk)
        reasons.push(`your backlogs (${studentProfile.backlogs}) exceed the maximum allowed (${drive.maxBacklogs})`)
      if (!branchOk)
        reasons.push(`your branch (${studentProfile.branch}) is not in the eligible branches (${drive.eligibleBranches.join(", ") || "all"})`)
      results.push(
        `**${drive.title} (${drive.company})**: You are not eligible. Reason: ${reasons.join("; ")}.`
      )
    }
  }

  return results.length > 0 ? results.join("\n\n") : "No active drives found."
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
  for (const app of applications) {
    const slot = assignments.find((a) => a.slot.driveId === app.driveId)
    const interviewInfo = slot
      ? ` Interview scheduled: ${slot.slot.startTime.toLocaleDateString()} ${slot.slot.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${slot.slot.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`
      : ""
    lines.push(
      `**${app.drive.title} (${app.drive.company})**: Status — ${app.status}.${interviewInfo}`
    )
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

  return `Based on skills of placed students, here are the top 3 high-value skills you could add or strengthen:\n\n1. **${missing[0]}**\n2. **${missing[1] || ""}**\n3. **${missing[2] || ""}**\n\nFocus on these along with your current skills, aptitude, and interview preparation to improve your placement chances.`
}

function handleGeneral(_query: string): string {
  return `**Placement preparation – structured guide**

**1. Technical preparation**
- Revise core CS fundamentals (DSA, DBMS, OS, networks).
- Practice coding regularly on platforms like LeetCode or CodeChef.
- Be ready to explain projects and technologies on your resume.

**2. Aptitude preparation**
- Practice quantitative aptitude, logical reasoning, and verbal ability.
- Use standard placement preparation resources and mock tests.
- Manage time in timed tests.

**3. Resume improvement**
- Keep resume to 1 page, clear sections (Education, Skills, Projects, Experience).
- Use action verbs and quantify achievements where possible.
- Tailor it to the role and company when applying.

**4. Interview strategy**
- Research the company and role before the interview.
- Prepare short introductions and common HR and technical questions.
- Practice mock interviews and clear communication.`
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
