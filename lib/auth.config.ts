import type { NextAuthConfig } from "next-auth"

export default {
    providers: [],
    trustHost: true,
    pages: {
        signIn: "/auth/login",
    },
} satisfies NextAuthConfig