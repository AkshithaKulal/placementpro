import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Role-based route protection
    if (path.startsWith("/dashboard/tpo") && token.role !== UserRole.TPO) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path.startsWith("/dashboard/student") && token.role !== UserRole.STUDENT) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path.startsWith("/dashboard/alumni") && token.role !== UserRole.ALUMNI) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
  ],
}
