# SendGrid Email Notification Setup

## Overview

The PlacementPro application now includes email notifications for students when new placement drives are created or activated. This implementation uses SendGrid API for reliable email delivery.

## Current Implementation Status

✅ **Email notifications are now implemented!**

### What Was Implemented:

1. **SendGrid Integration** (`lib/email.ts`)
   - Email sending utility using SendGrid API
   - HTML email template generator for drive notifications
   - Error handling and logging

2. **Enhanced Notification System** (`lib/notifications.ts`)
   - Sends both in-app notifications (database) AND email notifications
   - Automatically finds eligible students based on drive criteria
   - Sends personalized emails to each eligible student

3. **API Endpoints Updated**
   - `POST /api/tpo/drives` - Sends notifications when drive is created with ACTIVE status
   - `PATCH /api/tpo/drives/[id]` - Sends notifications when drive status changes to ACTIVE

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install `@sendgrid/mail` package that was added to `package.json`.

### 2. Get SendGrid API Key

1. Sign up for a free SendGrid account at https://sendgrid.com
2. Verify your email address
3. Go to Settings → API Keys
4. Create a new API Key with "Full Access" permissions
5. Copy the API key (you'll only see it once!)

### 3. Verify Sender Email (Required by SendGrid)

1. Go to Settings → Sender Authentication
2. Either:
   - **Single Sender Verification**: Add and verify a single email address
   - **Domain Authentication**: Verify your entire domain (recommended for production)

### 4. Configure Environment Variables

Update your `.env` file:

```env
# SendGrid Email Configuration
SENDGRID_API_KEY="SG.your-actual-api-key-here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"  # Must be verified in SendGrid
```

**Important Notes:**
- `SENDGRID_FROM_EMAIL` must be a verified sender in your SendGrid account
- For testing, you can use the single sender email you verified
- For production, use domain authentication

### 5. Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. As a TPO user, create a new placement drive with status "ACTIVE"
   - Or create a drive as "DRAFT" and then update it to "ACTIVE"

3. Check:
   - Eligible students should receive in-app notifications
   - Eligible students should receive email notifications
   - Check SendGrid dashboard for email delivery status

## How It Works

### When Notifications Are Sent:

1. **Drive Created as ACTIVE**: When a TPO creates a new drive with status "ACTIVE"
2. **Drive Activated**: When a TPO updates a drive status from "DRAFT" or "CLOSED" to "ACTIVE"

### Eligibility Criteria:

Students are notified if they meet ALL of these criteria:
- CGPA >= drive.minCGPA
- Backlogs <= drive.maxBacklogs
- Branch is in drive.eligibleBranches (or all branches if empty)

### Email Content Includes:

- Personalized greeting with student name
- Drive title and company name
- Complete eligibility details (CGPA, backlogs, branches)
- Location and package information (if available)
- Registration deadline
- Drive description
- Direct link to view and apply

## Email Template

The email uses a professional HTML template with:
- Responsive design
- Branded header
- Clear call-to-action button
- All drive details in an organized format
- Footer with contact information

## Troubleshooting

### Emails Not Sending?

1. **Check SendGrid API Key**: Ensure `SENDGRID_API_KEY` is set correctly in `.env`
2. **Check Sender Verification**: `SENDGRID_FROM_EMAIL` must be verified in SendGrid
3. **Check SendGrid Dashboard**: View email activity and delivery status
4. **Check Server Logs**: Look for error messages in console
5. **Check Email Limits**: Free SendGrid accounts have daily sending limits (100 emails/day)

### Common Errors:

- **"The from address does not match a verified Sender Identity"**
  → Verify the sender email in SendGrid dashboard

- **"Invalid API key"**
  → Check that `SENDGRID_API_KEY` is correct and starts with "SG."

- **"Rate limit exceeded"**
  → You've hit SendGrid's sending limits (upgrade plan or wait)

## Production Considerations

1. **Domain Authentication**: Set up domain authentication instead of single sender
2. **Email Templates**: Consider using SendGrid Dynamic Templates for better customization
3. **Error Handling**: Implement retry logic for failed emails
4. **Queue System**: For large batches, consider using a job queue (BullMQ is already installed)
5. **Monitoring**: Set up monitoring for email delivery rates
6. **Unsubscribe**: Add unsubscribe links for compliance

## API Response

The notification function returns:
```typescript
{
  notified: number,      // Number of in-app notifications created
  emailsSent: number,   // Number of emails successfully sent
  errors?: string[]     // Array of error messages (if any)
}
```

## Next Steps

- [ ] Set up SendGrid account and get API key
- [ ] Verify sender email address
- [ ] Update `.env` file with credentials
- [ ] Test email notifications
- [ ] Monitor email delivery in SendGrid dashboard
