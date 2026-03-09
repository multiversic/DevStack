import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"

// Composants Icones
import {
    AlertTriangle,
    ArrowUpRight,
    CalendarDays,
    CreditCard,
    LineChart,
    Wallet
} from "lucide-react"

// Import de composants UI partagés (à créer ultérieurement)
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { DonutChart } from "@/components/dashboard/donut-chart"
// import { UpcomingPaymentsList } from "@/components/dashboard/upcoming-list"

export default async function DashboardPage() {
    const session = await auth()

    // Sécurité: Redondance de validation (déjà géré par middleware/layout)
    if (!session?.user) return null

    const userCurrency = session.user.currency

    // --- 1. FETCH DES DONNÉES EN PARALLÈLE ---
    // On récupère les abonnements actifs, et le taux de change utilisateur par rapport à l'USD.
    const [subscriptions, userExchangeRate] = await Promise.all([
        db.subscription.findMany({
            where: { userId: session.user.id, isActive: true },
            orderBy: { nextPayment: 'asc' }
        }),
        db.exchangeRate.findUnique({
            where: { currency: userCurrency }
        })
    ])

    // Valeur par défaut si l'API de devises plante (Base USD)
    const rateMultiplier = userExchangeRate?.rate || 1

    // --- 2. LOGIQUE MÉTIER & CALCUL DES KPIs ---
    let totalMonthlyUSD = 0
    let totalAnnualUSD = 0
    let totalBillableUSD = 0
    const unusedSubscriptions = []
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Minuit pour comparer les paiements proprement

    const upcomingPayments = [] // Prochains 5 prélèvements

    for (const sub of subscriptions) {
        // a. Normalisation du prix en USD (Notre pivot interne)
        // NB: On interrogera la DB ExchangeRate pour plus de précision si sub.currency != USD
        // Pour simplifier le MVP, on asume ici que tout est enregistré au prix natif et converti à la volée.
        let normalizedPriceUSD = sub.price // Hypothèse: le sub price est inséré en USD en base.

        // b. Calculs Mensuel / Annuel
        if (sub.frequency === "MONTHLY") {
            totalMonthlyUSD += normalizedPriceUSD
            totalAnnualUSD += (normalizedPriceUSD * 12)
        } else if (sub.frequency === "YEARLY") {
            totalMonthlyUSD += (normalizedPriceUSD / 12)
            totalAnnualUSD += normalizedPriceUSD
        } else if (sub.frequency === "WEEKLY") {
            totalMonthlyUSD += (normalizedPriceUSD * 4.33)
            totalAnnualUSD += (normalizedPriceUSD * 52)
        }

        // c. Refacturable (a un Client Tag)
        if (sub.clientTag) {
            if (sub.frequency === "MONTHLY") totalBillableUSD += normalizedPriceUSD
            if (sub.frequency === "YEARLY") totalBillableUSD += (normalizedPriceUSD / 12)
        }

        // d. Détection Stack Dormante (UNUSED)
        if (sub.usage === "UNUSED") {
            unusedSubscriptions.push(sub)
        }

        // e. Prochains paiements (Filtrer ceux dont la date est >= demain/ajourdhui)
        if (sub.nextPayment >= today && upcomingPayments.length < 5) {
            upcomingPayments.push(sub)
        }
    }

    // Conversion finale dans la devise de l'User
    const monthlyCostLocal = totalMonthlyUSD * rateMultiplier
    const annualCostLocal = totalAnnualUSD * rateMultiplier
    const billableLocal = totalBillableUSD * rateMultiplier

    return (
        <div className="space-y-8">

            {/* HEADER DE PAGE */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Vue d'ensemble</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* ALERTES D'OPTIMISATION */}
            {unusedSubscriptions.length > 0 && (
                <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-warning">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold">Outils dormants détectés</h4>
                            <p className="mt-1 text-sm opacity-90">
                                Vous avez {unusedSubscriptions.length} abonnement(s) tagué(s) comme inutilisé(s) (ex: {unusedSubscriptions[0].toolName}).
                                Allez dans l'Audit de Stack pour calculer vos économies.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI GRID */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">Coût Mensuel</h3>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(monthlyCostLocal, userCurrency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        ≈ {formatCurrency(totalMonthlyUSD, "USD")}
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">Projection Annuelle</h3>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(annualCostLocal, userCurrency)}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">Prochain Prélèvement</h3>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold truncate">
                        {upcomingPayments[0] ? upcomingPayments[0].toolName : "Aucun"}
                    </div>
                    {upcomingPayments[0] && (
                        <p className="text-xs text-warning mt-1 font-medium flex items-center gap-1">
                            Le {new Date(upcomingPayments[0].nextPayment).toLocaleDateString('fr-FR')}
                        </p>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">Part Refacturable</h3>
                        <ArrowUpRight className="h-4 w-4 text-success" />
                    </div>
                    <div className="text-2xl font-bold text-success">
                        {formatCurrency(billableLocal, userCurrency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">/ mois</p>
                </div>

            </div>

            {/* GRAPHIQUES & LISTES */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Graphique Donut (Prend 4 colonnes sur 7) */}
                <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg">Répartition par catégorie</h3>
                        <p className="text-sm text-muted-foreground">Montants mensuels convertis en {userCurrency}</p>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
                        {/* Le rendu réel de Recharts sera encapsulé dans un Client Component plus tard */}
                        <p className="text-sm text-muted-foreground">Graphique Recharts (Client Component)</p>
                    </div>
                </div>

                {/* Liste détaillée (Prend 3 colonnes sur 7) */}
                <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg">À venir</h3>
                        <p className="text-sm text-muted-foreground">Vos prochains prélèvements</p>
                    </div>

                    <div className="space-y-4">
                        {upcomingPayments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Aucun paiement prévu prochainement.
                            </div>
                        ) : (
                            upcomingPayments.map((payment) => {
                                // Calcul du delta de jours
                                const diffTime = Math.abs(new Date(payment.nextPayment).getTime() - today.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const isUrgent = diffDays <= 3;

                                return (
                                    <div key={payment.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 bg-muted rounded-md flex items-center justify-center border border-border">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm leading-none">{payment.toolName}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                                        {diffDays === 0 ? "Aujourd'hui" : `J-${diffDays}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {/* Affichage natif + Local si possible. Ici on simplifie: Prix natif */}
                                            <p className="text-sm font-semibold">{formatCurrency(payment.price, payment.currency)}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
