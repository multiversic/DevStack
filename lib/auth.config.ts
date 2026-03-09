import type { NextAuthConfig } from "next-auth"

// Nous n'injectons pas encore CredentialsProvider ici, cela sera fait dans auth.ts
export default {
    providers: [],
    trustHost: true,
} satisfies NextAuthConfig
