import * as z from "zod"

// Les devises supportées par le MVP
const SUPPORTED_CURRENCIES = ["XOF", "XAF", "EUR", "USD", "MAD"] as const

export const registerSchema = z.object({
    name: z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom est trop long (maximum 50 caractères)"),

    email: z.string()
        .min(1, "L'adresse email est requise")
        .email("Format d'email invalide")
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
        .regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),

    currency: z.enum(SUPPORTED_CURRENCIES, {
        // Message personnalisé si la valeur ne fait pas partie de l'enum
        errorMap: () => ({ message: "Veuillez sélectionner une devise valide" })
    }).default("XOF")
})

export const loginSchema = z.object({
    email: z.string()
        .min(1, "L'adresse email est requise")
        .email("Format d'email invalide")
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(1, "Le mot de passe est requis")
})

// Types déduits pour TypeScript (à utiliser dans les composants Client)
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
