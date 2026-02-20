import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export class AlumniProfileError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = "AlumniProfileError"
  }
}

/**
 * Gets or creates an AlumniProfile for the given user ID.
 * This ensures that alumni users always have a profile, even if it wasn't created during signup.
 * 
 * @param userId - The user ID to get or create the profile for
 * @returns The AlumniProfile object
 * @throws AlumniProfileError if user doesn't exist or is not an ALUMNI
 */
export async function getOrCreateAlumniProfile(userId: string) {
  // First, verify the user exists and is an ALUMNI
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })

  if (!user) {
    throw new AlumniProfileError("User not found", 404)
  }

  if (user.role !== UserRole.ALUMNI) {
    throw new AlumniProfileError(
      `Access denied. User role must be ALUMNI, but got ${user.role}`,
      403
    )
  }

  // Try to find existing profile
  let alumniProfile = await prisma.alumniProfile.findUnique({
    where: { userId },
  })

  // If profile doesn't exist, create it automatically
  if (!alumniProfile) {
    try {
      alumniProfile = await prisma.alumniProfile.create({
        data: {
          userId,
          // All fields are optional, so we can create an empty profile
          // User can fill in details later through profile update
        },
      })
    } catch (error: any) {
      // Handle potential unique constraint violations or other DB errors
      if (error.code === "P2002") {
        // Profile was created concurrently, fetch it
        alumniProfile = await prisma.alumniProfile.findUnique({
          where: { userId },
        })
        if (!alumniProfile) {
          throw new AlumniProfileError("Failed to create alumni profile", 500)
        }
      } else {
        throw new AlumniProfileError(
          `Failed to create alumni profile: ${error.message}`,
          500
        )
      }
    }
  }

  return alumniProfile
}
