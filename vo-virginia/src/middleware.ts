import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const secureCookie = req.nextUrl.protocol === "https:"
  const cookieName = secureCookie
    ? "__Secure-authjs.session-token"
    : "authjs.session-token"
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, cookieName })
  const isAuthenticated = !!token
  const userRole = token?.role as string | undefined

  const publicRoutes = ["/", "/entrar", "/cadastro", "/guia-pedagogico", "/~offline", "/termos-de-uso", "/politica-de-privacidade"]
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (isPublicRoute) {
    if (isAuthenticated && (pathname === "/entrar" || pathname === "/cadastro")) {
      return NextResponse.redirect(new URL("/jogar", req.url))
    }
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/entrar", req.url))
  }

  if (pathname.startsWith("/painel") && userRole === "CHILD") {
    return NextResponse.redirect(new URL("/jogar", req.url))
  }

  if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/jogar", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|animations|images|fonts|sw\\.js|serwist-precache-manifest).*)",
  ],
}
