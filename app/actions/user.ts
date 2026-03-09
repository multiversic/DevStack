"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import * as z from "zod"

// On limite temporairement à la modification de la devise
const updateProfileSchema = z.object({
    currency: z.enum(["XOF", "XAF", "EUR", "USD", "MAD"], {
        errorMap: () => ({ message: "Devise invalide" })
    })
})

export async function updateUserCurrency(formData: FormData) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "Non autorisé" }

        const formCurrency = formData.get("currency")
        const validData = updateProfileSchema.parse({ currency: formCurrency })

        // Le check force update si inchangé pour pas de call API inutile
        if (session.user.currency === validData.currency) {
            return { success: true, message: "Aucun changement détecté" }
        }

        await db.user.update({
            where: { id: session.user.id },
            data: { currency: validData.currency }
        })

        // On force le re-matching total car ça affecte tout le dashboard
        revalidatePath("/", "layout")
        return { success: true, message: "Devise mise à jour avec succès. (Un rechargement peut être nécessaire pour relancer la session)." }

    } catch (error: any) {
        if (error.name === "ZodError") {
            return { error: error.errors[0].message || "Erreur de validation" }
        }
        console.error("[ACTION_UPDATE_USER_ERROR]", error)
        return { error: "Impossible de mettre à jour le profil." }
    }
}
