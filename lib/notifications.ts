import { prisma } from "@/lib/prisma"
import { sendEmail, generateDriveNotificationEmail } from "@/lib/email"
import { getEligibleStudents } from "@/lib/services/eligibility"

export async function notifyEligibleStudentsForDrive(driveId: string) {
  try {
    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
    })

    if (!drive || drive.status !== "ACTIVE") {
      return { notified: 0, emailsSent: 0, errors: [] }
    }

    // Use criteria engine: CGPA, backlogs, branch, 50% skill match
    const eligibleStudents = await getEligibleStudents(driveId)

    // Create in-app notifications for each eligible student
    const notifications = eligibleStudents.map((student) => ({
      userId: student.userId,
      title: `You are Eligible for ${drive.company}`,
      message: `A new placement drive for ${drive.company} is now open. ${drive.location ? `Location: ${drive.location}. ` : ""}${drive.package ? `Package: ${drive.package}. ` : ""}Minimum CGPA: ${drive.minCGPA}. Registration deadline: ${drive.registrationDeadline ? new Date(drive.registrationDeadline).toLocaleDateString() : "Not specified"}.`,
      type: "DRIVE",
    }))

    let notificationsCreated = 0
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      })
      notificationsCreated = notifications.length
    }

    // Send email notifications
    const emailResults = await Promise.allSettled(
      eligibleStudents.map(async (student) => {
        const studentName = student.name || "Student"
        const emailHtml = generateDriveNotificationEmail(
          studentName,
          drive.title,
          drive.company,
          {
            minCGPA: drive.minCGPA,
            maxBacklogs: drive.maxBacklogs,
            eligibleBranches: drive.eligibleBranches,
            location: drive.location || undefined,
            package: drive.package || undefined,
            registrationDeadline: drive.registrationDeadline || undefined,
            description: drive.description || undefined,
          },
          drive.id
        )

        return sendEmail({
          to: student.email,
          subject: `You are Eligible for ${drive.company}`,
          html: emailHtml,
        })
      })
    )

    const emailsSent = emailResults.filter((r) => r.status === "fulfilled" && r.value.success).length
    const emailErrors = emailResults
      .filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success))
      .map((r) => (r.status === "rejected" ? r.reason : r.value.error))

    console.log(
      `Drive notification completed: ${notificationsCreated} in-app notifications, ${emailsSent} emails sent`
    )

    return {
      notified: notificationsCreated,
      emailsSent,
      errors: emailErrors.length > 0 ? emailErrors : undefined,
    }
  } catch (error) {
    console.error("Error notifying students:", error)
    throw error
  }
}
