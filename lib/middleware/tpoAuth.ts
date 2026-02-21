import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import type { Session } from "next-auth"

export const TPO_ACCESS_DENIED_MESSAGE = "Access Denied: TPO Only"

export function tpoAccessDeniedResponse() {
  return NextResponse.json({ error: TPO_ACCESS_DENIED_MESSAGE }, { status: 403 })
}

/**
 * Validates session and TPO role. Call before any DB operations in /api/tpo/* routes.
 * Returns session if user is TPO, null otherwise. Use tpoAccessDeniedResponse() for 403.
 */
export async function requireTPO(): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== UserRole.TPO) {
    return null
  }
  return session
}
