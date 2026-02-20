import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import type { Session } from "next-auth"

export async function requireTPO(): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== UserRole.TPO) {
    return null
  }
  return session
}
