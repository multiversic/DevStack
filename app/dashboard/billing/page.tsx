import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import { ClientSelector } from "@/components/billing/client-selector"


// Icones
import {
    Building2,
    Copy,
    Download,
    ReceiptText
} from "lucide-react"

// Import de composants abstraits
// import { Button } from "@/components/ui/button"

export default async function BillingPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | undefined }
}) {
    const session = await auth()
    if (!session?.user) return null

    const userCurrency = session.user.currency
    const selectedClient = searchParams?.client || ''

    // 1. Récupération des tags clients distincts
    // Comme Prisma n'a pas de SELECT DISTINCT natif parfait pour les strings nullables dans un array,
    // on fait un groupBy sur clientTag pour extraire tous les tags utilisés par l'utilisateur.
    const tagsResult = await db.subscription.groupBy({
        by: ['clientTag'],
        where: {
            userId: session.user.id,
            clientTag: { not: null },
            isActive: true
        }
    })

    // On extrait un tableau propre de strings
    const availableClients = tagsResult
        .map(t => t.clientTag)
        .filter((tag): tag is string => tag !== null && tag.trim() !== '')

    // 2. Fetch des abonnements pour le client sélectionné, ET le taux de change
    const [subscriptionsForClient, userExchangeRate] = await Promise.all([
        selectedClient
            ? db.subscription.findMany({
                where: { userId: session.user.id, clientTag: selectedClient, isActive: true },
                orderBy: { toolName: 'asc' }
            })
            : Promise.resolve([]),

        db.exchangeRate.findUnique({
            where: { currency: userCurrency }
        })
    ])

    const rateMultiplier = userExchangeRate?.rate || 1

    // 3. Calculs des totaux mensuels pour CE client précis
    let totalUSD = 0
    for (const sub of subscriptionsForClient) {
        let normalizedUSD = sub.price // Hypothèse MVP: prix stocké = USD par défaut
        if (sub.frequency === "YEARLY") normalizedUSD = normalizedUSD / 12
        if (sub.frequency === "WEEKLY") normalizedUSD = normalizedUSD * 4.33
        totalUSD += normalizedUSD
    }

    const totalLocal = totalUSD * rateMultiplier

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Refacturation Client</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Générez un récapitulatif des outils utilisés pour vos clients.</p>
                </div>
            </div>

            {/* SÉLECTEUR DE CLIENT (Filtre) */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="w-full md:max-w-xs space-y-2">
                    <label htmlFor="client-select" className="text-sm font-medium">Sélectionner un client</label>
                    {/* Dans une SPA Next.js, on utiliserait un composant Client avec `useRouter()` pour push le paramètre ?client= */}
                    {/* Comme c'est un Server Component de structure, voici la balise form pure */}
                    <ClientSelector
                        availableClients={availableClients}
                        selectedClient={selectedClient}
                    />
                </div>

                {/* Résumé carte client : visible si client sélectionné */}
                {selectedClient && subscriptionsForClient.length > 0 && (
                    <div className="flex items-center gap-6 px-4 py-2 bg-muted/30 rounded-lg border border-border w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Client actif</p>
                                <p className="text-lg font-bold">{selectedClient}</p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-border hidden sm:block"></div>
                        <div className="text-right ml-auto sm:ml-0">
                            <p className="text-sm text-muted-foreground">Total refacturable / mois</p>
                            <p className="text-xl font-bold text-success">{formatCurrency(totalLocal, userCurrency)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* RÉSULTAT ET TABLEAU */}
            {!selectedClient ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
                    <ReceiptText className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold tracking-tight">Aucun client sélectionné</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        Sélectionnez un tag client dans le menu déroulant ci-dessus pour générer le rapport des frais d'outils facturables. Vous devez d'abord assigner des tags à vos abonnements dans l'onglet "Mes Abonnements".
                    </p>
                </div>
            ) : subscriptionsForClient.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-border bg-card">
                    <p className="text-muted-foreground">Il n'y a aucun abonnement actif tagué pour le client <strong>{selectedClient}</strong>.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-4 gap-6">

                    {/* Tableau détaillé (3 cols) */}
                    <div className="lg:col-span-3 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Outil</th>
                                    <th className="px-6 py-4 font-medium">Catégorie</th>
                                    <th className="px-6 py-4 font-medium text-right">Prix Original</th>
                                    <th className="px-6 py-4 font-medium text-right bg-accent/30">Prix Converti Mensuel</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subscriptionsForClient.map(sub => {

                                    // Conversion simplifiée pour l'affichage tableau
                                    let internalBase = sub.price
                                    if (sub.frequency === "YEARLY") internalBase = sub.price / 12
                                    if (sub.frequency === "WEEKLY") internalBase = sub.price * 4.33

                                    const localMonthlyPrice = internalBase * rateMultiplier

                                    const displayFreq = sub.frequency === "MONTHLY" ? "mois" : sub.frequency === "YEARLY" ? "an" : "semaine"

                                    return (
                                        <tr key={sub.id} className="hover:bg-accent/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{sub.toolName}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{sub.category}</td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                {formatCurrency(sub.price, sub.currency)} <span className="text-xs text-muted-foreground font-normal">/{displayFreq}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium bg-accent/10 whitespace-nowrap text-success">
                                                {formatCurrency(localMonthlyPrice, userCurrency)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Panneau latéral d'Actions (1 col) */}
                    <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <h3 className="font-semibold text-lg mb-4">Export & Copie</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Le récapitulatif est prêt à être intégré dans votre facture finale pour le client {selectedClient}.
                            </p>

                            <div className="space-y-3">
                                {/* Réservé pour Client Component : Fonctionnalité clipboard navigator.clipboard */}
                                <button className="flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 shadow-sm">
                                    <Copy className="h-4 w-4" />
                                    Copier le texte formaté
                                </button>

                                {session.user.isPremium ? (
                                    <button className="flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors bg-background border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
                                        <Download className="h-4 w-4" />
                                        Exporter en CSV
                                    </button>
                                ) : (
                                    <div className="relative group">
                                        <button disabled className="flex w-full items-center justify-center rounded-md text-sm font-medium bg-muted text-muted-foreground h-10 px-4 py-2 gap-2 opacity-60 cursor-not-allowed">
                                            <Download className="h-4 w-4" />
                                            Exporter en CSV (Pro)
                                        </button>
                                        <div className="absolute inset-x-0 -bottom-8 hidden group-hover:block text-center text-xs text-primary font-medium">
                                            Nécessite DevStack Pro
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
