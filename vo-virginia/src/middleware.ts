import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const userRole = req.auth?.user?.role

  const publicRoutes = ["/", "/entrar", "/cadastro"]
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

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|animations|images|fonts).*)",
  ],
}
