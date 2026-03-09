import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"

// Icones
import {
    Activity,
    AlertCircle,
    CopyMinus,
    PiggyBank,
    ShieldAlert,
    TrendingDown,
    Trash2
} from "lucide-react"

export default async function AuditPage() {
    const session = await auth()
    if (!session?.user) return null

    const userCurrency = session.user.currency

    // 1. Fetch de toutes les données et du taux d'échange
    const [subscriptions, userExchangeRate] = await Promise.all([
        db.subscription.findMany({
            where: { userId: session.user.id, isActive: true },
            orderBy: { price: "desc" }
        }),
        db.exchangeRate.findUnique({
            where: { currency: userCurrency }
        })
    ])

    const rate = userExchangeRate?.rate || 1

    // 2. Variables pour l'Algorithme d'Audit
    let score = 100
    let totalAnnualSpentUSD = 0
    let unusedAnnualSpentUSD = 0
    let nbUnused = 0
    let nbDoublons = 0

    const unusedTools = []
    const categoryMap = new Map<string, typeof subscriptions>()
    const potentialDuplicates = []

    for (const sub of subscriptions) {
        // Normalisation coût annuel (USD pivot supposé)
        let annualSubCost = sub.price
        if (sub.frequency === "MONTHLY") annualSubCost = sub.price * 12
        if (sub.frequency === "WEEKLY") annualSubCost = sub.price * 52

        totalAnnualSpentUSD += annualSubCost

        // Outils inutilisés
        if (sub.usage === "UNUSED") {
            nbUnused++
            unusedAnnualSpentUSD += annualSubCost
            unusedTools.push(sub)
        }

        // Algorithmique basique pour détection des doublons (Même catégorie)
        const existingCat = categoryMap.get(sub.category) || []
        existingCat.push(sub)
        categoryMap.set(sub.category, existingCat)
    }

    // Analyse des doublons
    categoryMap.forEach((subs, catName) => {
        if (subs.length > 1) {
            nbDoublons += (subs.length - 1)
            // On suggère de garder le moins cher, et on ajoute les autres en doublons
            const sortedByPriceDesc = [...subs].sort((a, b) => b.price - a.price)
            potentialDuplicates.push({ category: catName, tools: sortedByPriceDesc })
        }
    })

    // 3. Calcul du Score de Stack (Basé sur la formule demandée)
    // -15 pts par outil Unused
    // -10 pts par doublon
    // -30 pts de bonus/malus partiel calculé selon le %(dépense_unused / depense_totale)
    score -= (nbUnused * 15)
    score -= (nbDoublons * 10)

    if (totalAnnualSpentUSD > 0) {
        const percentageUnusedCost = (unusedAnnualSpentUSD / totalAnnualSpentUSD)
        score -= (percentageUnusedCost * 30)
    }

    // Constriction stricte entre 0 et 100
    score = Math.max(0, Math.min(100, Math.round(score)))

    // 4. Conversion Financière pour affichage (Devise Locale)
    const totalAnnualCostLocal = totalAnnualSpentUSD * rate
    const savingsLocal = unusedAnnualSpentUSD * rate

    // Définition de la teinte du score
    let scoreColor = "text-success"
    let scoreRing = "border-success text-success"
    let scoreText = "Excellent"

    if (score < 80) { scoreColor = "text-warning"; scoreRing = "border-warning text-warning"; scoreText = "Moyen"; }
    if (score < 50) { scoreColor = "text-destructive"; scoreRing = "border-destructive text-destructive"; scoreText = "Critique"; }

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stack Audit</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Analysez, optimisez et réduisez le coût caché de vos abonnements.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* SCORE DE STACK (Affiche la jauge circulaire) */}
                <div className="lg:col-span-1 rounded-xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="font-semibold text-lg text-muted-foreground mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Score de santé
                    </h3>

                    <div className={`relative flex h-48 w-48 items-center justify-center rounded-full border-[10px] ${scoreRing} bg-background shadow-inner`}>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-6xl font-black tracking-tighter">{score}</span>
                            <span className="text-sm font-semibold uppercase tracking-wider mt-1 opacity-80">/ 100</span>
                        </div>
                        {/* SVG Cercle parfait de remplissage omis pour simplicité, utilisons les bordures épaisses ou `recharts` RadialBar si besoin */}
                    </div>

                    <div className="mt-6 space-y-1">
                        <p className={`text-xl font-bold ${scoreColor}`}>{scoreText}</p>
                        <p className="text-sm text-muted-foreground w-48">Basé sur l'utilisation et la redondance de vos outils.</p>
                    </div>
                </div>

                {/* STATS D'OPTIMISATION */}
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">

                    {/* Outils dormants */}
                    <div className={`rounded-xl border ${nbUnused > 0 ? "border-destructive bg-destructive/5" : "border-border bg-card"} p-6 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-md ${nbUnused > 0 ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">Outils dormants</h3>
                        </div>
                        <p className="text-3xl font-bold mb-1">{nbUnused}</p>
                        <p className="text-sm text-muted-foreground">Abonnements marqués comme "UNUSED". Impact direct sur le score : -{nbUnused * 15} pts.</p>
                    </div>

                    {/* Doublons */}
                    <div className={`rounded-xl border ${nbDoublons > 0 ? "border-warning bg-warning/5" : "border-border bg-card"} p-6 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-md ${nbDoublons > 0 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                                <CopyMinus className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">Redondances</h3>
                        </div>
                        <p className="text-3xl font-bold mb-1">{nbDoublons}</p>
                        <p className="text-sm text-muted-foreground">Outils remplissant la même fonction (même catégorie). Impact direct : -{nbDoublons * 10} pts.</p>
                    </div>

                    {/* Économie Potentielle - Prend toute la largeur via col-span-2 sur Desktop si ré-array */}
                    <div className="sm:col-span-2 rounded-xl border border-success/30 bg-success/5 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-success font-semibold">
                                <PiggyBank className="h-5 w-5" />
                                Économies annuelles réalisables
                            </div>
                            <p className="text-sm text-muted-foreground">En résiliant instantanément tous vos outils dormants (UNUSED).</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-4xl font-black text-success tracking-tight">+{formatCurrency(savingsLocal, userCurrency)}</p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 pt-4">

                {/* LISTE DORMANT */}
                <div className="space-y-4">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-destructive" />
                        Vampires financiers
                    </h3>
                    {unusedTools.length === 0 ? (
                        <div className="p-6 text-center rounded-xl border border-dashed border-border bg-card/50">
                            <p className="text-muted-foreground text-sm">Félicitations, vous n'avez aucun outil dormant déclaré.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {unusedTools.map(sub => (
                                <div key={sub.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between shadow-sm hover:border-destructive/30 transition-colors">
                                    <div>
                                        <p className="font-semibold text-sm">{sub.toolName}</p>
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{formatCurrency(sub.price, sub.currency)} / {sub.frequency === "MONTHLY" ? "mois" : "an"}</p>
                                    </div>
                                    {/* Action Directe Utilisateur : Client Component (bouton supression sans confirmation ici pour fast-delete) */}
                                    <button className="h-8 px-3 rounded text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-1.5 transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Résilier
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* LISTE DOUBLONS */}
                <div className="space-y-4">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <CopyMinus className="h-5 w-5 text-warning" />
                        Doublons fonctionnels
                    </h3>
                    {potentialDuplicates.length === 0 ? (
                        <div className="p-6 text-center rounded-xl border border-dashed border-border bg-card/50">
                            <p className="text-muted-foreground text-sm">Stack propre : Aucun chevauchement de catégorie détecté.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {potentialDuplicates.map((group, idx) => (
                                <div key={idx} className="bg-card border border-border rounded-lg p-4 shadow-sm">
                                    <div className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Conflit : {group.category}
                                    </div>
                                    <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-border">
                                        {group.tools.map((tool, i) => (
                                            <div key={tool.id} className="relative flex items-center justify-between pl-6 group">
                                                {/* Puce Visuelle */}
                                                <div className={`absolute left-0 h-[6px] w-[6px] rounded-full top-[14px] ${i === 0 ? "bg-warning ring-2 ring-warning/30" : "bg-muted-foreground"}`}></div>
                                                <div>
                                                    <p className={`text-sm ${i === 0 ? "font-bold" : "font-medium text-muted-foreground"}`}>{tool.toolName}</p>
                                                    <p className="text-xs text-muted-foreground">{formatCurrency(tool.price, tool.currency)} / {tool.frequency}</p>
                                                </div>
                                                <div className="text-xs">
                                                    {i === 0 ? (
                                                        <span className="bg-warning/10 text-warning px-2 py-0.5 rounded font-medium border border-warning/20">Le plus coûteux</span>
                                                    ) : (
                                                        <span className="bg-success/10 text-success px-2 py-0.5 rounded font-medium border border-success/20">À privilégier</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
