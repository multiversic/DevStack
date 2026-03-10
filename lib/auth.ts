import "server-only"
import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            currency: string
            isPremium: boolean
        }
    }
    interface User {
        currency: string
        isPremium: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        currency: string
        isPremium: boolean
    }
}

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("L'email et le mot de passe sont requis.")
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user || !user.password) {
                    throw new Error("Identifiants incorrects.")
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isValid) {
                    throw new Error("Identifiants incorrects.")
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency,
                    isPremium: user.isPremium,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.currency = user.currency
                token.isPremium = user.isPremium
            }
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name
                if (session.currency) token.currency = session.currency
                if (session.isPremium !== undefined) token.isPremium = session.isPremium
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id
                session.user.currency = token.currency
                session.user.isPremium = token.isPremium
            }
            return session
        },
    },
}

import { getServerSession } from "next-auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
export const auth = () => getServerSession(authOptions)