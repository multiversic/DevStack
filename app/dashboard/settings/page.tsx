import { auth } from "@/lib/auth"
import { updateUserCurrency } from "@/app/actions/user" // Server Action

// Icones
import {
    Building2,
    CreditCard,
    Globe,
    KeyRound,
    Star,
    UserCircle
} from "lucide-react"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user) return null

    const user = session.user

    return (
        <div className="space-y-8 max-w-4xl">

            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
                <p className="text-muted-foreground mt-1 text-sm">Gérez les préférences de votre compte et votre abonnement.</p>
            </div>

            <div className="grid gap-8 pb-10">

                {/* SECTION PROFIL & PRÉFÉRENCES */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-border pb-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        Profil & Préférences
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-border bg-card p-5">
                            <label className="text-sm font-medium text-muted-foreground">Nom d'affichage</label>
                            <p className="text-lg font-medium mt-1">{user.name || "Utilisateur"}</p>
                            <p className="text-sm text-muted-foreground mt-2">{user.email}</p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-5 relative overflow-hidden">
                            <label className="text-sm font-medium text-muted-foreground block mb-2">Devise Locale</label>
                            {/* Formulaire Server Action Natif pour changer la devise */}
                            <form action={updateUserCurrency} className="flex gap-2">
                                <select
                                    name="currency"
                                    defaultValue={user.currency}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="XOF">Franc CFA (XOF)</option>
                                    <option value="XAF">Franc CFA (XAF)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                    <option value="USD">Dollar (USD)</option>
                                    <option value="MAD">Dirham (MAD)</option>
                                </select>
                                {/* Un simple bouton submit, dans une vraie app on utiliserait useFormStatus pour le loading state */}
                                <button type="submit" className="h-10 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                                    Sauver
                                </button>
                            </form>
                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                Cette devise sera utilisée comme référence pour tous vos calculs et le tableau inverse.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECTION ABONNEMENT (PRO/FREE) */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-border pb-2">
                        <Star className="h-5 w-5 text-muted-foreground" />
                        Plan d'abonnement
                    </h2>

                    <div className={`rounded-xl border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${user.isPremium ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">{user.isPremium ? "DevStack Pro" : "Plan Gratuit"}</h3>
                                {user.isPremium && <Badge variant="default">Actif</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {user.isPremium
                                    ? "Vous avez accès à toutes les fonctionnalités avancées, l'export CSV et le support prioritaire."
                                    : "Passez au plan Pro pour débloquer l'export CSV client, les analyses croisées et supprimer les limites."}
                            </p>
                        </div>

                        <div className="w-full md:w-auto">
                            {user.isPremium ? (
                                <button className="w-full md:w-auto px-4 py-2 bg-background border border-border text-foreground font-medium rounded-md hover:bg-muted transition-colors text-sm">
                                    Gérer la facturation (Stripe)
                                </button>
                            ) : (
                                <button className="w-full md:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-transform active:scale-95 text-sm flex items-center justify-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Passer à Pro (9€/mois)
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* SECTION SÉCURITÉ (Mock) */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-border pb-2 text-destructive">
                        <KeyRound className="h-5 w-5" />
                        Sécurité & Accès
                    </h2>
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-destructive">Changer de mot de passe</h4>
                            <p className="text-sm text-destructive/80 mt-1">Générez un lien sécurisé pour mettre à jour vos accès.</p>
                        </div>
                        <button disabled className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-md font-medium text-sm disabled:opacity-50 min-w-[150px]">
                            Envoyer le lien
                        </button>
                    </div>
                </section>

            </div>
        </div>
    )
}

// Helper inline UI (Si le composant global Badge n'est pas encore créé)
function Badge({ children, variant = "default" }: { children: React.ReactNode, variant?: string }) {
    const cn = variant === "default" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cn}`}>{children}</span>
}
