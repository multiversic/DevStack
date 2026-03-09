"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import * as z from "zod"

const updateProfileSchema = z.object({
    currency: z.enum(["XOF", "XAF", "EUR", "USD", "MAD"], {
        errorMap: () => ({ message: "Devise invalide" }),
    }),
})

export async function updateUserCurrency(formData: FormData): Promise<void> {
    try {
        const session = await auth()
        if (!session?.user?.id) return

        const formCurrency = formData.get("currency")
        const validData = updateProfileSchema.parse({ currency: formCurrency })

        if (session.user.currency === validData.currency) return

        await db.user.update({
            where: { id: session.user.id },
            data: { currency: validData.currency },
        })

        revalidatePath("/", "layout")

    } catch (error: any) {
        if (error.name === "ZodError") return
        console.error("[ACTION_UPDATE_USER_ERROR]", error)
    }
}