import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations/auth"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // 1. Validation stricte des données entrantes via Zod
        const { name, email, password, currency } = registerSchema.parse(body)

        // 2. Vérification de l'existence de l'utilisateur
        const existingUser = await db.user.findUnique({
            where: { email },
            select: { id: true } // Ne ramener que l'ID pour la propreté/perf
        })

        if (existingUser) {
            // Sécurité : Renvoyer un 409 Conflict clair si l'email est déjà pris
            return NextResponse.json(
                { error: "Cet email est déjà associé à un compte." },
                { status: 409 }
            )
        }

        // 3. Hachage du mot de passe (Salt factor 12 comme imposé)
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // 4. Création de l'utilisateur en base
        const newUser = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                currency,
                isPremium: false, // Forcé false à la création
            },
            select: {
                id: true,
                name: true,
                email: true,
                currency: true,
                createdAt: true
            }
        })

        // 5. Réponse de succès
        return NextResponse.json(
            { message: "Compte créé avec succès", user: newUser },
            { status: 201 }
        )

    } catch (error: any) {
        if (error.name === "ZodError") {
            // Erreur de validation de format : on la renvoie au client proprement
            return NextResponse.json(
                { error: "Données invalides", issues: error.errors },
                { status: 400 }
            )
        }

        // Fallback : Ne jamais exposer les erreurs brutes de Prisma ou variables du serveur
        console.error("[REGISTER_ERROR]", error)
        return NextResponse.json(
            { error: "Une erreur interne s'est produite lors de l'inscription." },
            { status: 500 }
        )
    }
}


export const runtime = "nodejs"