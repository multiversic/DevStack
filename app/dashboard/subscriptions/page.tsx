import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import { SubscriptionSheet } from "@/components/subscriptions/subscription-sheet"


// Icones
import {
    Plus,
    Search,
    MoreHorizontal,
    FileEdit,
    Trash2,
    AlertCircle
} from "lucide-react"

// Import des composants abstraits (à créer plus tard)
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { SubscriptionSheet } from "@/components/subscriptions/subscription-sheet"
// import { DeleteSubscriptionDialog } from "@/components/subscriptions/delete-dialog"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function SubscriptionsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | undefined }
}) {
    const session = await auth()
    if (!session?.user) return null

    // 1. Récupération des paramètres de filtrage depuis l'URL (pratique Next.js natif pour SSG/SSR)
    const filterUsage = searchParams?.usage || 'ALL'
    const searchQuery = searchParams?.q || ''

    // 2. Construction de la requête Prisma dynamiquement
    const whereClause: any = {
        userId: session.user.id,
        isActive: true, // On omet l'historique archivé pour le MVP
    }

    if (filterUsage !== 'ALL') {
        whereClause.usage = filterUsage
    }

    if (searchQuery) {
        whereClause.toolName = {
            contains: searchQuery,
            mode: 'insensitive' // Recherche insensible à la casse
        }
    }

    // 3. Exécution de la requête
    const subscriptions = await db.subscription.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' } // Plus récents d'abord
    })

    // 4. Récupération du catalogue pour le formulaire d'ajout (Sheet)
    const catalogTools = await db.toolCatalog.findMany({
        select: { id: true, name: true, category: true, defaultPrice: true, defaultCurrency: true, logoUrl: true },
        orderBy: { name: 'asc' }
    })

    // Formatage helpers locaux
    const translateFrequency = (freq: string) => {
        switch (freq) {
            case 'WEEKLY': return "Hebdomadaire"
            case 'MONTHLY': return "Mensuel"
            case 'YEARLY': return "Annuel"
            default: return freq
        }
    }

    const translateUsage = (usage: string) => {
        switch (usage) {
            case 'HIGH': return { label: "Intensif", color: "bg-success/10 text-success border-success/20" }
            case 'LOW': return { label: "Occasionnel", color: "bg-warning/10 text-warning border-warning/20" }
            case 'UNUSED': return { label: "Inutilisé", color: "bg-destructive/10 text-destructive border-destructive/20" }
            default: return { label: usage, color: "bg-muted text-muted-foreground" }
        }
    }

    return (
        <div className="space-y-6">

            {/* HEADER : Titre + Bouton Ajout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mes Abonnements</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Gérez et suivez l'ensemble de vos outils récurrents.</p>
                </div>

                {/* Réservé au Client Component : Bouton ouvrant le Sheet */}
                <SubscriptionSheet catalogTools={catalogTools} />
            </div>

            {/* BARRE D'OUTILS : Recherche & Filtres */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-3 rounded-lg border border-border shadow-sm">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher un outil..."
                        defaultValue={searchQuery}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>

                <div className="flex w-full sm:w-auto items-center gap-2">
                    <select
                        defaultValue={filterUsage}
                        className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="HIGH">Usage Intensif</option>
                        <option value="LOW">Usage Occasionnel</option>
                        <option value="UNUSED">Inutilisés</option>
                    </select>
                </div>
            </div>

            {/* ÉTAT VIDE */}
            {subscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
                    <div className="h-12 w-12 rounded-full bg-accent text-muted-foreground flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">Aucun abonnement trouvé</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        {searchQuery ? "Aucun outil ne correspond à votre recherche." : "Vous n'avez pas encore ajouté d'abonnement. Commencez par en ajouter un depuis le catalogue."}
                    </p>
                </div>
            ) : (
                /* TABLEAU DE DONNÉES (Desktop) */
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden hidden md:block">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Outil</th>
                                <th className="px-6 py-4 font-medium">Catégorie</th>
                                <th className="px-6 py-4 font-medium">Prix</th>
                                <th className="px-6 py-4 font-medium">Fréquence</th>
                                <th className="px-6 py-4 font-medium">Prochain Paiement</th>
                                <th className="px-6 py-4 font-medium">Utilisation</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {subscriptions.map((sub) => {
                                const usageStyle = translateUsage(sub.usage)

                                return (
                                    <tr key={sub.id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-md bg-muted border border-border shrink-0 flex items-center justify-center">
                                                    {/* Image Logo (Remplacer img par next/image en prod) */}
                                                    {sub.logoUrl ? (
                                                        <img src={sub.logoUrl} alt={sub.toolName} className="h-5 w-5 object-contain" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-muted-foreground">{sub.toolName.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="font-medium">{sub.toolName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {sub.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {formatCurrency(sub.price, sub.currency)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {translateFrequency(sub.frequency)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatDate(sub.nextPayment, true)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${usageStyle.color}`}>
                                                {usageStyle.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {/* Dropdown Menu : Réservé pour composants clients (shadcn) */}
                                            <button className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground flex flex-row justify-center items-center mr-0 ml-auto transition-colors">
                                                <span className="sr-only">Actions</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* VUE MOBILE CARDS (Visible uniquement sur petits écrans < md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {subscriptions.map((sub) => {
                    const usageStyle = translateUsage(sub.usage)
                    return (
                        <div key={sub.id} className="bg-card rounded-lg border border-border p-4 flex flex-col gap-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-muted border border-border flex items-center justify-center">
                                        {sub.logoUrl ? (
                                            <img src={sub.logoUrl} alt={sub.toolName} className="h-6 w-6 object-contain" />
                                        ) : (
                                            <span className="text-sm font-bold text-muted-foreground">{sub.toolName.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{sub.toolName}</h3>
                                        <p className="text-xs text-muted-foreground">{sub.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">{formatCurrency(sub.price, sub.currency)}</div>
                                    <div className="text-xs text-muted-foreground uppercase">{translateFrequency(sub.frequency)}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Prochain paiement</span>
                                    <span className="text-sm font-medium">{formatDate(sub.nextPayment, true)}</span>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${usageStyle.color}`}>
                                    {usageStyle.label}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

        </div>
    )
}
