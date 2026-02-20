import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "AE", "BT", "CHE"]
const SKILLS = [
  "JavaScript",
  "Python",
  "Java",
  "React",
  "Node.js",
  "SQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Git",
  "TypeScript",
  "Angular",
  "Vue.js",
  "Express",
  "Spring Boot",
  "Machine Learning",
  "Data Structures",
  "Algorithms",
]

async function main() {
  console.log("Starting seed...")

  // Create TPO user
  const tpoPassword = await bcrypt.hash("tpo123", 10)
  const tpo = await prisma.user.upsert({
    where: { email: "tpo@college.edu" },
    update: {},
    create: {
      email: "tpo@college.edu",
      passwordHash: tpoPassword,
      name: "TPO Admin",
      role: UserRole.TPO,
    },
  })
  console.log("Created TPO user")

  // Create Alumni users
  const alumniPassword = await bcrypt.hash("alumni123", 10)
  const alumni1 = await prisma.user.upsert({
    where: { email: "alumni1@example.com" },
    update: {},
    create: {
      email: "alumni1@example.com",
      passwordHash: alumniPassword,
      name: "John Alumni",
      role: UserRole.ALUMNI,
      alumniProfile: {
        create: {
          company: "Google",
          position: "Senior Software Engineer",
          year: 2020,
          linkedin: "https://linkedin.com/in/johnalumni",
        },
      },
    },
  })

  const alumni2 = await prisma.user.upsert({
    where: { email: "alumni2@example.com" },
    update: {},
    create: {
      email: "alumni2@example.com",
      passwordHash: alumniPassword,
      name: "Jane Alumni",
      role: UserRole.ALUMNI,
      alumniProfile: {
        create: {
          company: "Microsoft",
          position: "Product Manager",
          year: 2019,
          linkedin: "https://linkedin.com/in/janealumni",
        },
      },
    },
  })
  console.log("Created Alumni users")

  // Create Student users (50 students)
  const studentPassword = await bcrypt.hash("student123", 10)
  const students = []

  for (let i = 1; i <= 50; i++) {
    const enrollmentNo = `EN2024${String(i).padStart(3, "0")}`
    const email = `student${i}@college.edu`
    const cgpa = Math.round((Math.random() * 2 + 6) * 100) / 100 // 6.0 to 8.0
    const backlogs = Math.floor(Math.random() * 3) // 0 to 2
    const branch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)]
    const year = 2024 + Math.floor(Math.random() * 2) // 2024 or 2025

    // Random skills (2-5 skills per student)
    const numSkills = Math.floor(Math.random() * 4) + 2
    const studentSkills = []
    const availableSkills = [...SKILLS]
    for (let j = 0; j < numSkills; j++) {
      const skillIndex = Math.floor(Math.random() * availableSkills.length)
      studentSkills.push(availableSkills.splice(skillIndex, 1)[0])
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: studentPassword,
        name: `Student ${i}`,
        role: UserRole.STUDENT,
        studentProfile: {
          create: {
            enrollmentNo,
            branch,
            year,
            CGPA: cgpa,
            backlogs,
            skills: studentSkills,
            phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    })

    if (user.studentProfile) {
      students.push(user.studentProfile)
    }
  }
  console.log(`Created ${students.length} student users`)

  // Create Placement Drives (5 drives)
  const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple"]
  const driveTitles = [
    "Software Engineer",
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
  ]

  const drives = []
  for (let i = 0; i < 5; i++) {
    const minCGPA = Math.round((Math.random() * 1.5 + 6.5) * 100) / 100 // 6.5 to 8.0
    const maxBacklogs = Math.floor(Math.random() * 2) // 0 or 1
    const eligibleBranches = []
    const numBranches = Math.floor(Math.random() * 3) + 1 // 1 to 3 branches
    const availableBranches = [...BRANCHES]
    for (let j = 0; j < numBranches; j++) {
      const branchIndex = Math.floor(Math.random() * availableBranches.length)
      eligibleBranches.push(availableBranches.splice(branchIndex, 1)[0])
    }

    const drive = await prisma.placementDrive.create({
      data: {
        title: `${driveTitles[i]} - 2024`,
        description: `Exciting opportunity for ${driveTitles[i]} position at ${companies[i]}. Join our team and work on cutting-edge projects.`,
        company: companies[i],
        status: i < 3 ? "ACTIVE" : "DRAFT", // First 3 active, rest draft
        minCGPA,
        maxBacklogs,
        eligibleBranches,
        location: ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi"][i],
        package: `${Math.floor(Math.random() * 10) + 10} LPA`,
        registrationDeadline: new Date(
          Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      },
    })

    drives.push(drive)

    // Create some applications for active drives
    if (drive.status === "ACTIVE") {
      const eligibleStudents = students.filter(
        (s) =>
          s.CGPA >= drive.minCGPA &&
          s.backlogs <= drive.maxBacklogs &&
          (drive.eligibleBranches.length === 0 ||
            drive.eligibleBranches.includes(s.branch))
      )

      // Randomly select 5-15 eligible students to apply
      const numApplications = Math.min(
        Math.floor(Math.random() * 11) + 5,
        eligibleStudents.length
      )
      const selectedStudents = eligibleStudents
        .sort(() => Math.random() - 0.5)
        .slice(0, numApplications)

      for (const student of selectedStudents) {
        await prisma.application.create({
          data: {
            studentId: student.id,
            driveId: drive.id,
            status:
              Math.random() > 0.7
                ? "SHORTLISTED"
                : Math.random() > 0.9
                ? "SELECTED"
                : "PENDING",
          },
        })
      }
    }
  }
  console.log(`Created ${drives.length} placement drives`)

  // Create some job referrals
  for (let i = 0; i < 3; i++) {
    await prisma.jobReferral.create({
      data: {
        alumniId: (await prisma.alumniProfile.findFirst())!.id,
        company: companies[i],
        position: driveTitles[i],
        description: `Great opportunity at ${companies[i]} for ${driveTitles[i]} role.`,
        requirements: [
          "Strong problem-solving skills",
          "Good communication",
          "Team player",
        ],
        link: `https://${companies[i].toLowerCase()}.com/careers`,
        isActive: true,
      },
    })
  }
  console.log("Created job referrals")

  // Create some mentorship slots
  const alumniProfile = await prisma.alumniProfile.findFirst()
  if (alumniProfile) {
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i + 1)
      await prisma.mentorshipSlot.create({
        data: {
          alumniId: alumniProfile.id,
          date,
          startTime: "10:00",
          endTime: "11:00",
          topic: i % 2 === 0 ? "Interview Preparation" : "Career Guidance",
          isBooked: i < 2, // First 2 booked
        },
      })
    }
    console.log("Created mentorship slots")
  }

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
