import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"
import authConfig from "./auth.config"

// --- Extension stricte des types de NextAuth ---
// Permet à TypeScript de reconnaître nos champs custom (currency, isPremium)
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

declare module "@auth/core/jwt" {
    interface JWT {
        id: string
        currency: string
        isPremium: boolean
    }
}
// ------------------------------------------------

export const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // Expiration : 7 jours
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login", // Redirige vers login si erreur (géré côté client)
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("L'email et le mot de passe sont requis.")
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) {
                    throw new Error("Identifiants incorrects.")
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                // Sécurité : Renvoyer un message générique pour ne pas divulguer si l'email existe ou non
                if (!isValid) {
                    throw new Error("Identifiants incorrects.")
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency,
                    isPremium: user.isPremium
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Injection initale au moment de la connexion
            if (user) {
                token.id = user.id
                token.currency = user.currency
                token.isPremium = user.isPremium
            }

            // Permet la mise à jour forcée de la session (ex: l'user change sa devise)
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name
                if (session.currency) token.currency = session.currency
                if (session.isPremium !== undefined) token.isPremium = session.isPremium
            }
            return token
        },
        async session({ session, token }) {
            // Transmission du token sécurisé vers l'objet session exposé au client
            if (token && session.user) {
                session.user.id = token.id
                session.user.currency = token.currency
                session.user.isPremium = token.isPremium
            }
            return session
        }
    }
})
