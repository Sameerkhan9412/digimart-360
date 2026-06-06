import { NextResponse } from "next/server"
import { clearAuthCookies } from "src/lib/auth/jwt"

export async function POST(request: Request) {
  await clearAuthCookies()
  const origin = new URL(request.url).origin
  return NextResponse.redirect(origin + "/", { status: 303 })
}
