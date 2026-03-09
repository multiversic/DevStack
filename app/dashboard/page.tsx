// app/(dashboard)/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import {
    AlertTriangle, ArrowUpRight, CalendarDays,
    CreditCard, LineChart, Wallet
} from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user) return null

    const userCurrency = session.user.currency

    // ── 1. FETCH EN PARALLÈLE ──────────────────────────────────────────────────
    const [subscriptions, exchangeRates] = await Promise.all([
        db.subscription.findMany({
            where: { userId: session.user.id, isActive: true },
            orderBy: { nextPayment: "asc" },
        }),
        db.exchangeRate.findMany(),
    ])

    // ── 2. TABLE DE TAUX (base USD) ───────────────────────────────────────────
    // Open Exchange Rates stocke tout en base USD.
    // Pour convertir A → B : montantUSD = amount / rates[A], puis montantB = montantUSD * rates[B]
    const rates: Record<string, number> = {}
    for (const r of exchangeRates) {
        rates[r.currency] = r.rate
    }
    // USD est toujours 1 (base)
    rates["USD"] = rates["USD"] ?? 1

    function toUserCurrency(amount: number, fromCurrency: string): number {
        if (fromCurrency === userCurrency) return amount
        const rateFrom = rates[fromCurrency] ?? 1
        const rateTo = rates[userCurrency] ?? 1
        return (amount / rateFrom) * rateTo
    }

    // ── 3. CALCUL DES KPIs ────────────────────────────────────────────────────
    let totalMonthlyLocal = 0
    let totalAnnualLocal = 0
    let totalBillableLocal = 0
    const unusedSubscriptions: typeof subscriptions = []
    const upcomingPayments: typeof subscriptions = []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const sub of subscriptions) {
        // Calcul du montant mensuel normalisé dans la devise de l'utilisateur
        let monthlyInUserCurrency = 0

        if (sub.frequency === "MONTHLY") {
            monthlyInUserCurrency = toUserCurrency(sub.price, sub.currency)
        } else if (sub.frequency === "YEARLY") {
            monthlyInUserCurrency = toUserCurrency(sub.price / 12, sub.currency)
        } else if (sub.frequency === "WEEKLY") {
            monthlyInUserCurrency = toUserCurrency(sub.price * 4.33, sub.currency)
        }

        totalMonthlyLocal += monthlyInUserCurrency
        totalAnnualLocal += monthlyInUserCurrency * 12

        // Part refacturable
        if (sub.clientTag) {
            totalBillableLocal += monthlyInUserCurrency
        }

        // Outils inutilisés
        if (sub.usage === "UNUSED") {
            unusedSubscriptions.push(sub)
        }

        // Prochains paiements (max 5)
        if (sub.nextPayment >= today && upcomingPayments.length < 5) {
            upcomingPayments.push(sub)
        }
    }

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Vue d'ensemble</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </div>
            </div>

            {/* ALERTE OUTILS INUTILISÉS */}
            {unusedSubscriptions.length > 0 && (
                <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-warning">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold">Outils dormants détectés</h4>
                            <p className="mt-1 text-sm opacity-90">
                                Vous avez {unusedSubscriptions.length} abonnement(s) inutilisé(s)
                                (ex : {unusedSubscriptions[0].toolName}).
                                Consultez l'Audit de Stack pour calculer vos économies.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI GRID */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Coût Mensuel</h3>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(totalMonthlyLocal, userCurrency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {subscriptions.length} abonnement(s) actif(s)
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Projection Annuelle</h3>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(totalAnnualLocal, userCurrency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        sur 12 mois
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Prochain Prélèvement</h3>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold truncate">
                        {upcomingPayments[0]?.toolName ?? "Aucun"}
                    </div>
                    {upcomingPayments[0] && (
                        <p className="text-xs text-warning mt-1 font-medium">
                            Le {new Date(upcomingPayments[0].nextPayment).toLocaleDateString("fr-FR")}
                            {" · "}
                            {formatCurrency(
                                toUserCurrency(upcomingPayments[0].price, upcomingPayments[0].currency),
                                userCurrency
                            )}
                        </p>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Part Refacturable</h3>
                        <ArrowUpRight className="h-4 w-4 text-success" />
                    </div>
                    <div className="text-2xl font-bold text-success">
                        {formatCurrency(totalBillableLocal, userCurrency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">/ mois</p>
                </div>

            </div>

            {/* GRAPHIQUES & LISTES */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Graphique Donut — placeholder Client Component */}
                <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg">Répartition par catégorie</h3>
                        <p className="text-sm text-muted-foreground">
                            Montants mensuels en {userCurrency}
                        </p>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">Graphique Recharts (à venir)</p>
                    </div>
                </div>

                {/* Liste prochains paiements */}
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
                                const diffTime = new Date(payment.nextPayment).getTime() - today.getTime()
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                const isUrgent = diffDays <= 3

                                return (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 bg-muted rounded-md flex items-center justify-center border border-border">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm leading-none">{payment.toolName}</p>
                                                <span className={`mt-1.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${isUrgent
                                                        ? "bg-destructive/10 text-destructive"
                                                        : "bg-muted text-muted-foreground"
                                                    }`}>
                                                    {diffDays === 0 ? "Aujourd'hui" : diffDays < 0 ? "Dépassé" : `J-${diffDays}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">
                                                {formatCurrency(
                                                    toUserCurrency(payment.price, payment.currency),
                                                    userCurrency
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(payment.price, payment.currency)}
                                            </p>
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
