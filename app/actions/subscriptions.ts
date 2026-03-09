"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { subscriptionSchema, type SubscriptionInput } from "@/lib/validations/subscription"
import { calculateNextPayment } from "@/lib/utils"

export async function createSubscription(data: Omit<SubscriptionInput, "id">) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Vous devez être connecté" }
        }

        // 1. Validation stricte des données (Zod bloque ici si c'est invalide)
        const validData = subscriptionSchema.parse(data)

        // 2. Formatage du client tag
        const clientTag = validData.clientTag?.trim() || null

        // 3. Création en base
        await db.subscription.create({
            data: {
                userId: session.user.id,
                toolName: validData.toolName,
                category: validData.category,
                price: validData.price,
                currency: validData.currency,
                frequency: validData.frequency,
                nextPayment: new Date(validData.nextPayment), // Force le format Date interne
                usage: validData.usage,
                clientTag: clientTag,
                note: validData.note,
                isActive: validData.isActive,
                logoUrl: validData.logoUrl,
            }
        })

        // 4. Invalidation du cache de la route pour mettre à jour la vue instantanément
        revalidatePath("/dashboard")
        revalidatePath("/subscriptions")

        return { success: true, message: "Abonnement ajouté avec succès" }

    } catch (error: any) {
        if (error.name === "ZodError") {
            return { error: "Erreur de validation", issues: error.errors }
        }
        console.error("[ACTION_CREATE_SUB_ERROR]", error)
        return { error: "Impossible de créer l'abonnement" }
    }
}

export async function updateSubscription(data: SubscriptionInput) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "Non autorisé" }

        const validData = subscriptionSchema.parse(data)
        if (!validData.id) return { error: "ID manquant" }

        // 1. Double vérification (BFLA mitigation) : 
        // l'Abonnement appartient bien à la session courante.
        const subsCount = await db.subscription.count({
            where: { id: validData.id, userId: session.user.id }
        })

        if (subsCount === 0) return { error: "Abonnement introuvable ou non autorisé" }

        await db.subscription.update({
            where: { id: validData.id },
            data: {
                toolName: validData.toolName,
                category: validData.category,
                price: validData.price,
                currency: validData.currency,
                frequency: validData.frequency,
                nextPayment: new Date(validData.nextPayment),
                usage: validData.usage,
                clientTag: validData.clientTag?.trim() || null,
                note: validData.note,
                isActive: validData.isActive,
                logoUrl: validData.logoUrl,
            }
        })

        revalidatePath("/dashboard")
        revalidatePath("/subscriptions")
        return { success: true, message: "Mise à jour réussie" }

    } catch (error) {
        console.error("[ACTION_UPDATE_SUB_ERROR]", error)
        return { error: "Impossible de mettre à jour" }
    }
}

export async function deleteSubscription(id: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "Non autorisé" }

        // IDOR mitigation (sécurité)
        const existing = await db.subscription.findUnique({
            where: { id },
            select: { userId: true }
        })

        if (!existing || existing.userId !== session.user.id) {
            return { error: "Vous n'avez pas l'autorisation pour cette action" }
        }

        await db.subscription.delete({ where: { id } })

        revalidatePath("/dashboard")
        revalidatePath("/subscriptions")
        return { success: true, message: "Abonnement supprimé" }

    } catch (error) {
        console.error("[ACTION_DELETE_SUB_ERROR]", error)
        return { error: "Impossible de supprimer l'abonnement" }
    }
}

// Action utilitaire : marquer un abonnement ponctuel comme payé
export async function markAsPaid(id: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "Non autorisé" }

        const sub = await db.subscription.findUnique({
            where: { id, userId: session.user.id }
        })

        if (!sub) return { error: "Abonnement introuvable" }

        // Recalcul de la prochaine date
        const newNextPayment = calculateNextPayment(sub.frequency, sub.nextPayment)

        await db.subscription.update({
            where: { id },
            data: { nextPayment: newNextPayment }
        })

        revalidatePath("/dashboard")
        return { success: true, message: "Échéance repoussée" }
    } catch (e) {
        return { error: "Une erreur est survenue" }
    }
}
