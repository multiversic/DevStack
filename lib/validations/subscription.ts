import * as z from "zod"

// Enums alignés sur le schéma Prisma
const frequencies = ["WEEKLY", "MONTHLY", "YEARLY"] as const
const usages = ["HIGH", "LOW", "UNUSED"] as const

export const subscriptionSchema = z.object({
    id: z.string().uuid().optional(), // Présent uniquement lors d'une mise à jour

    toolName: z.string()
        .min(2, "Le nom de l'outil est requis (min. 2 caractères)")
        .max(100, "Le nom de l'outil est trop long")
        .trim(),

    category: z.string()
        .min(2, "La catégorie est requise")
        .max(50, "Le nom de la catégorie est trop long")
        .trim(),

    price: z.number({
        required_error: "Le montant est requis",
        invalid_type_error: "Le montant doit être un nombre valide",
    }).min(0, "Le prix ne peut pas être négatif"),

    currency: z.string()
        .length(3, "La devise doit faire exactement 3 lettres (ex: USD, EUR)")
        .toUpperCase(),

    frequency: z.enum(frequencies, {
        errorMap: () => ({ message: "Fréquence invalide (WEEKLY, MONTHLY, YEARLY)" })
    }),

    nextPayment: z.date({
        required_error: "La date du prochain paiement est requise",
        invalid_type_error: "Format de date invalide",
    }),

    clientTag: z.string()
        .max(50, "Le tag client est trop long")
        .trim()
        .optional()
        .nullable(),

    usage: z.enum(usages).default("HIGH"),

    note: z.string()
        .max(500, "La note ne doit pas dépasser 500 caractères")
        .trim()
        .optional()
        .nullable(),

    isActive: z.boolean().default(true),

    logoUrl: z.string()
        .url("L'URL du logo doit être valide")
        .optional()
        .nullable(),
})

// Schéma spécifique pour marquer un abonnement comme refacturé
export const generateBillingSchema = z.object({
    clientTag: z.string().min(1, "Veuillez sélectionner un client"),
    targetCurrency: z.string().length(3).toUpperCase()
})

// Export des types déduits
export type SubscriptionInput = z.infer<typeof subscriptionSchema>
export type BillingInput = z.infer<typeof generateBillingSchema>
