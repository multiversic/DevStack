import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSubscriptionSchema = z.object({
    toolName: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    currency: z.enum(["USD", "EUR", "XOF", "XAF", "MAD"]).optional(),
    frequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY"]).optional(),
    nextPayment: z.string().datetime().optional(),
    clientTag: z.string().optional().nullable(),
    usage: z.enum(["HIGH", "LOW", "UNUSED"]).optional(),
    note: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
})

// PATCH — Modifier un abonnement
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        const body = await req.json()
        const parsed = updateSubscriptionSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        // Sécurité IDOR : on force userId pour que l'user ne puisse modifier que ses propres données
        const subscription = await db.subscription.updateMany({
            where: { id: params.id, userId: session.user.id },
            data: parsed.data,
        })

        if (subscription.count === 0) {
            return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 })
    }
}

// DELETE — Supprimer un abonnement
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        // Sécurité IDOR : deleteMany avec userId garantit que l'user supprime uniquement le sien
        const result = await db.subscription.deleteMany({
            where: { id: params.id, userId: session.user.id },
        })

        if (result.count === 0) {
            return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 })
    }
}

export const runtime = "nodejs"