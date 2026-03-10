import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createSubscriptionSchema = z.object({
    toolName: z.string().min(1, "Le nom est requis"),
    category: z.string().min(1, "La catégorie est requise"),
    price: z.number().positive("Le prix doit être positif"),
    currency: z.enum(["USD", "EUR", "XOF", "XAF", "MAD"]),
    frequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY"]),
    nextPayment: z.string().datetime(),
    clientTag: z.string().optional().nullable(),
    usage: z.enum(["HIGH", "LOW", "UNUSED"]).default("HIGH"),
    note: z.string().optional().nullable(),
})

// GET — Liste des abonnements de l'utilisateur connecté
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        const subscriptions = await db.subscription.findMany({
            where: { userId: session.user.id, isActive: true },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(subscriptions)
    } catch {
        return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 })
    }
}

// POST — Créer un nouvel abonnement
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        const body = await req.json()
        const parsed = createSubscriptionSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        const subscription = await db.subscription.create({
            data: {
                userId: session.user.id,
                toolName: parsed.data.toolName,
                category: parsed.data.category,
                price: parsed.data.price,
                currency: parsed.data.currency,
                frequency: parsed.data.frequency,
                nextPayment: new Date(parsed.data.nextPayment),
                clientTag: parsed.data.clientTag || null,
                usage: parsed.data.usage,
                note: parsed.data.note || null,
            },
        })

        return NextResponse.json(subscription, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 })
    }
}

export const runtime = "nodejs"