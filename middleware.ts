import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { UserRole } from "@prisma/client"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Dashboard and API protection - require auth
  const isDashboard = path.startsWith("/dashboard")
  const isTpoApi = path.startsWith("/api/tpo")
  const isProtectedApi = path.startsWith("/api/protected")

  if (!isDashboard && !isTpoApi && !isProtectedApi) {
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    if (isTpoApi) {
      return NextResponse.json(
        { error: "Access Denied: TPO Only" },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  const role = token.role as UserRole | undefined

  // TPO dashboard: only TPO can access
  if (path.startsWith("/dashboard/tpo")) {
    if (role !== UserRole.TPO) {
      return NextResponse.redirect(new URL("/dashboard/student", req.url))
    }
  }

  // TPO API: only TPO can access
  if (isTpoApi) {
    if (role !== UserRole.TPO) {
      return NextResponse.json(
        { error: "Access Denied: TPO Only" },
        { status: 403 }
      )
    }
  }

  // Student dashboard: only STUDENT can access
  if (path.startsWith("/dashboard/student")) {
    if (role !== UserRole.STUDENT) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Alumni dashboard: only ALUMNI can access
  if (path.startsWith("/dashboard/alumni")) {
    if (role !== UserRole.ALUMNI) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/tpo/:path*", "/api/protected/:path*"],
}
