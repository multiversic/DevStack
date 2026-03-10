// middleware.ts
import NextAuth from "next-auth"
import authConfig from "./lib/auth.config"

const { auth } = NextAuth(authConfig)

const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/api/cron/reminders",
    "/api/cron/exchange-rates"
]

const authRoutes = [
    "/auth/login",
    "/auth/register",
]

const apiAuthPrefix = "/api/auth"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    if (isApiAuthRoute) return

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) callbackUrl += nextUrl.search
        const encodedCallbackUrl = encodeURIComponent(callbackUrl)
        return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
    }

    return
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}