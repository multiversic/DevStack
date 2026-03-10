import type { NextAuthConfig } from "next-auth"

export default {
    providers: [],
    trustHost: true,
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
            if (isOnDashboard) {
                return isLoggedIn
            }
            return true
        },
    },
} satisfies NextAuthConfig