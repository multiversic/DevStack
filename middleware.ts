import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const publicRoutes = ["/", "/auth/login", "/auth/register"]
const authRoutes = ["/auth/login", "/auth/register"]

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        salt: process.env.NEXTAUTH_SECRET,
    })

    const { pathname } = req.nextUrl
    const isLoggedIn = !!token
    const isAuthRoute = authRoutes.includes(pathname)
    const isPublicRoute = publicRoutes.includes(pathname)
    const isApiAuth = pathname.startsWith("/api/auth")
    const isApiCron = pathname.startsWith("/api/cron")

    if (isApiAuth || isApiCron) return NextResponse.next()

    if (isLoggedIn && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
        const callbackUrl = encodeURIComponent(pathname)
        return NextResponse.redirect(
            new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url)
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}