import sgMail from "@sendgrid/mail"

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY is not set. Email notifications will be disabled.")
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

const DEFAULT_FROM = "noreply@placementpro.com"

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("Email notification skipped (SendGrid not configured):", { to, subject })
    return { success: false, error: "SendGrid API key not configured" }
  }

  const fromAddress = from || process.env.SENDGRID_FROM_EMAIL || DEFAULT_FROM

  try {
    const msg = {
      to,
      from: fromAddress,
      subject,
      html,
    }

    await sgMail.send(msg)
    console.log(`Email sent successfully to ${to}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error sending email:", error)
    if (error.response?.body?.errors) {
      const senderError = error.response.body.errors.find(
        (e: { field?: string }) => e.field === "from"
      )
      if (senderError) {
        console.error(
          "SendGrid: The 'from' address must be a verified Sender Identity. " +
            "Add and verify your sender in SendGrid (Settings → Sender Authentication), " +
            "then set SENDGRID_FROM_EMAIL in .env to that exact email (e.g. your Gmail or company email). " +
            "Current from:", fromAddress
        )
      }
      console.error("SendGrid error details:", error.response.body)
    }
    return { success: false, error: error.message }
  }
}

export function generateDriveNotificationEmail(
  studentName: string,
  driveTitle: string,
  company: string,
  driveDetails: {
    minCGPA: number
    maxBacklogs: number
    eligibleBranches: string[]
    location?: string
    package?: string
    registrationDeadline?: Date
    description?: string
  },
  /** Optional: link to apply page with this drive highlighted */
  driveId?: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const applyUrl = driveId
    ? `${baseUrl}/dashboard/student/drives?driveId=${encodeURIComponent(driveId)}`
    : `${baseUrl}/dashboard/student/drives`
  const deadlineText = driveDetails.registrationDeadline
    ? new Date(driveDetails.registrationDeadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified"

  const branchesText =
    driveDetails.eligibleBranches.length > 0
      ? driveDetails.eligibleBranches.join(", ")
      : "All Branches"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Placement Drive Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">New Placement Drive Available!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <p style="font-size: 16px;">Hello ${studentName},</p>
    
    <p style="font-size: 16px;">We're excited to inform you that a new placement drive is now open and you are eligible to apply!</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0;">${driveTitle}</h2>
      <p style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px;">${company}</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Drive Details</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">Minimum CGPA:</td>
          <td style="padding: 8px 0;">${driveDetails.minCGPA}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Maximum Backlogs:</td>
          <td style="padding: 8px 0;">${driveDetails.maxBacklogs}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Eligible Branches:</td>
          <td style="padding: 8px 0;">${branchesText}</td>
        </tr>
        ${driveDetails.location ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Location:</td>
          <td style="padding: 8px 0;">${driveDetails.location}</td>
        </tr>
        ` : ""}
        ${driveDetails.package ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Package:</td>
          <td style="padding: 8px 0;">${driveDetails.package}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Registration Deadline:</td>
          <td style="padding: 8px 0; color: #d32f2f; font-weight: bold;">${deadlineText}</td>
        </tr>
      </table>
    </div>
    
    ${driveDetails.description ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Description</h3>
      <p style="white-space: pre-wrap;">${driveDetails.description}</p>
    </div>
    ` : ""}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${applyUrl}" 
         style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        View & Apply Now
      </a>
    </div>
    <p style="font-size: 12px; color: #666; text-align: center;">Click the button above to open the application page and apply for this drive.</p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Don't miss this opportunity! Make sure to apply before the registration deadline.
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      Best regards,<br>
      <strong>PlacementPro Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
    <p>This is an automated notification from PlacementPro.</p>
    <p>If you have any questions, please contact your TPO office.</p>
  </div>
</body>
</html>
  `.trim()
}
