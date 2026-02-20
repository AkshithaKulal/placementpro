# PlacementPro - Integrated Campus Career Suite

A comprehensive campus placement management system built for hackathons with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

### For TPO (Training & Placement Officer)
- Create and manage placement drives
- Smart eligibility criteria engine (CGPA, backlogs, branches)
- Real-time analytics dashboard
- Application management
- Interview slot scheduling

### For Students
- Profile management
- View eligible placement drives
- Apply to drives
- Track application status
- Skill gap analysis with radar charts
- Resume builder with PDF generation
- AI-powered PlacementBot for guidance

### For Alumni
- Post job referrals
- Create mentorship slots
- Connect with students

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (JWT)
- **Charts**: Recharts
- **PDF**: @react-pdf/renderer
- **AI**: OpenAI API

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/placementpro?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (for PlacementBot)
OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Seed demo data (50 students, 5 drives)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Demo Credentials

After seeding, you can use these credentials:

### TPO
- Email: `tpo@college.edu`
- Password: `tpo123`

### Student
- Email: `student1@college.edu` to `student50@college.edu`
- Password: `student123`

### Alumni
- Email: `alumni1@example.com` or `alumni2@example.com`
- Password: `alumni123`

## Project Structure

```
app/
  (auth)/          # Authentication pages
  (dashboard)/     # Dashboard pages
    tpo/           # TPO dashboard
    student/       # Student dashboard
    alumni/        # Alumni dashboard
  api/             # API routes
components/        # Reusable components
lib/              # Utilities and helpers
prisma/           # Database schema and seeds
```

## Key Features Implementation

### Eligibility Criteria Engine
The system uses Prisma queries to filter students based on:
- Minimum CGPA
- Maximum backlogs
- Eligible branches

### Skill Gap Analysis
- Select multiple students
- Compare skill frequency
- Visualize with radar charts
- Identify missing skills

### Resume Builder
- Multi-step form
- Client-side PDF generation
- Instant download
- No server upload required

### PlacementBot
- OpenAI GPT-3.5 integration
- Context-aware responses
- Student profile injection
- Active drives information

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The project is configured for Vercel deployment with:
- Automatic Prisma generation on build
- Environment variable support
- Serverless function optimization

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Database Studio
npm run db:studio
```

## Notes

- All operations are synchronous (no background jobs)
- Designed for hackathon scale (50-200 users)
- No Redis, BullMQ, or complex infrastructure
- Simple and stable for live demos

## License

MIT
