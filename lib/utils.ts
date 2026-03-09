import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fusionne intelligemment les classes Tailwind (gère les conflits).
 * Standard de facto pour shadcn/ui.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formate un montant dans la devise spécifiée avec les règles linguistiques françaises.
 */
export function formatCurrency(amount: number, currency: string = "XOF"): string {
    try {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount)
    } catch (error) {
        // Sécurité fallback si la devise n'est pas supportée par le navigateur cible
        return `${amount.toFixed(2)} ${currency}`
    }
}

/**
 * Calcule la date du prochain paiement basé sur la fréquence de l'abonnement.
 */
export function calculateNextPayment(frequency: "WEEKLY" | "MONTHLY" | "YEARLY", fromDate: Date = new Date()): Date {
    const next = new Date(fromDate)
    if (frequency === "WEEKLY") {
        next.setDate(next.getDate() + 7)
    } else if (frequency === "MONTHLY") {
        next.setMonth(next.getMonth() + 1)
    } else if (frequency === "YEARLY") {
        next.setFullYear(next.getFullYear() + 1)
    }
    return next
}

/**
 * Formate une date au format français court (ex: 24 Oct) ou long.
 */
export function formatDate(date: Date, includeYear: boolean = false): string {
    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
    }
    if (includeYear) {
        options.year = "numeric"
    }
    return new Intl.DateTimeFormat("fr-FR", options).format(new Date(date))
}
