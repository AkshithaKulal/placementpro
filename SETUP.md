# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (use Neon for free cloud database)
- OpenAI API key (for PlacementBot feature)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:5432/placementpro"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Setup Database
```bash
# Push Prisma schema to database
npm run db:push

# Seed demo data (50 students, 5 drives, 2 alumni)
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Demo Accounts

After seeding:

**TPO:**
- Email: `tpo@college.edu`
- Password: `tpo123`

**Student:**
- Email: `student1@college.edu` (or student2-50)
- Password: `student123`

**Alumni:**
- Email: `alumni1@example.com`
- Password: `alumni123`

## Features Checklist

✅ Authentication (NextAuth JWT)
✅ TPO Dashboard
  - Create Placement Drives
  - Eligibility Criteria Engine
  - Analytics Dashboard
  - Application Management
✅ Student Dashboard
  - Profile Management
  - View Eligible Drives
  - Apply to Drives
  - Application Tracking
  - Skill Gap Analysis (Radar Chart)
  - Resume Builder (PDF Generation)
  - PlacementBot (AI Chat)
✅ Alumni Dashboard
  - Job Referrals
  - Mentorship Slots

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel URL)
   - `OPENAI_API_KEY`
4. Deploy

Vercel will automatically:
- Run `prisma generate` on build
- Deploy API routes as serverless functions

## Troubleshooting

**Database connection issues:**
- Verify DATABASE_URL format
- Check database is accessible
- Run `npm run db:push` again

**Authentication issues:**
- Ensure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain

**OpenAI API errors:**
- Verify API key is correct
- Check API quota/billing

## Project Structure

```
app/
  (auth)/              # Sign in/up pages
  (dashboard)/
    tpo/               # TPO features
    student/           # Student features
    alumni/            # Alumni features
  api/                 # API routes
components/ui/         # Reusable UI components
lib/                   # Utilities, auth, prisma
prisma/
  schema.prisma        # Database schema
  seed.ts             # Demo data seeder
```

## Key Files

- `prisma/schema.prisma` - Database models
- `lib/auth.ts` - NextAuth configuration
- `middleware.ts` - Route protection
- `app/api/` - All API endpoints

## Notes

- All operations are synchronous (no background jobs)
- Designed for hackathon scale (50-200 users)
- No Redis/BullMQ required
- Simple and stable for demos
