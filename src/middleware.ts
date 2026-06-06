import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Edge-compatible JWT base64 decoder
function decodeJWT(token: string) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = atob(payloadBase64)
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("access_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value

  const user = accessToken ? decodeJWT(accessToken) : null

  // 1. If trying to access protected paths and not logged in (neither token exists)
  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/buyer")

  if (isProtectedPath && !accessToken && !refreshToken) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Enforce Role restrictions
  if (user) {
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    
    if (pathname.startsWith("/seller") && user.role !== "seller" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    
    if (pathname.startsWith("/buyer") && !["buyer", "seller", "admin"].includes(user.role)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Redirect logged-in users away from auth pages
    if (pathname.startsWith("/auth")) {
      let dashboard = "/buyer"
      if (user.role === "admin") dashboard = "/admin"
      else if (user.role === "seller") dashboard = "/seller"
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/buyer/:path*", "/auth/:path*"],
}
