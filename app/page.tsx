import Link from "next/link"
import { auth } from "@/lib/auth"

// Icones
import {
    BarChart3,
    ArrowRight,
    ShieldCheck,
    BellRing,
    Wallet,
    CheckCircle2,
    Lock
} from "lucide-react"

export default async function LandingPage() {
    const session = await auth()

    // Si déjà loggué, on adapte le CTA principal
    const ctaLink = session?.user ? "/dashboard" : "/auth/register"
    const ctaText = session?.user ? "Accéder au Dashboard" : "Commencer gratuitement"

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">

            {/* NAVBAR */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 max-w-7xl items-center justify-between px-4 md:px-8 mx-auto">
                    <div className="flex flex-row items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline-flex">DevStack</span>
                    </div>

                    <nav className="flex items-center gap-4">
                        {session?.user ? (
                            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                                Mon Espace
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block">
                                    Connexion
                                </Link>
                                <Link href="/auth/register" className="h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm">
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center">

                {/* HERO SECTION */}
                <section className="w-full py-24 md:py-32 flex flex-col items-center text-center px-4 relative overflow-hidden">
                    {/* Spotlight efffect */}
                    <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background -z-10"></div>

                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Le tableau de bord parfait pour freelances
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground pb-4">
                        Reprenez le contrôle de <br className="hidden md:block" />
                        votre stack technique.
                    </h1>

                    <p className="mt-4 text-xl text-muted-foreground max-w-2xl px-4 leading-relaxed">
                        Concentrez-vous sur le code. Nous traquons vos abonnements SaaS, les refacturons à vos clients et optimisons vos dépenses automatiquement.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
                        <Link href={ctaLink} className="h-12 px-8 inline-flex items-center justify-center rounded-md text-base font-semibold bg-primary text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/20 gap-2">
                            {ctaText} <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="#features" className="h-12 px-8 inline-flex items-center justify-center rounded-md text-base font-medium border border-input bg-card hover:bg-accent hover:text-accent-foreground transition-colors">
                            Voir les fonctionnalités
                        </Link>
                    </div>

                    {/* MOCKUP IMAGE (Placeholder CSS strict) */}
                    <div className="mt-20 w-full max-w-5xl rounded-xl border border-border bg-card/50 shadow-2xl overflow-hidden aspect-[16/9] relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
                        <div className="w-full h-8 bg-muted/80 border-b border-border flex items-center px-4 gap-2">
                            <div className="h-3 w-3 rounded-full bg-destructive/80"></div>
                            <div className="h-3 w-3 rounded-full bg-warning/80"></div>
                            <div className="h-3 w-3 rounded-full bg-success/80"></div>
                        </div>
                        <div className="p-8 text-left grid grid-cols-4 gap-4 opacity-50">
                            <div className="col-span-1 border-r border-border h-[400px] flex flex-col gap-4">
                                <div className="h-4 w-24 bg-muted rounded"></div>
                                <div className="h-4 w-32 bg-muted rounded"></div>
                                <div className="h-4 w-20 bg-muted rounded"></div>
                            </div>
                            <div className="col-span-3 h-full flex flex-col gap-6 pl-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-24 bg-muted rounded-xl border border-border"></div>
                                    <div className="h-24 bg-muted rounded-xl border border-border"></div>
                                    <div className="h-24 bg-muted rounded-xl border border-border"></div>
                                </div>
                                <div className="h-[250px] bg-muted/50 rounded-xl border border-border w-full"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section id="features" className="w-full py-24 bg-muted/30 border-t border-border">
                    <div className="container px-4 md:px-8 max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pourquoi DevStack ?</h2>
                            <p className="mt-4 text-muted-foreground">Oubliez les fichiers Excel, passez en mode automatique.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors group">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Suivi financier</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">Conversion temps réel des monnaies. Voyez instantanément votre run rate en FCFA, Euro ou USD.</p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors group">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Refacturation Client</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">Associez un abonnement à un client et générez des rapports de charge d'un simple clic.</p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors group">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BellRing className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Rappels Éclairés</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">Soyez notifié (7j, 3j, 1j) avant le renouvellement d'un outil pour annuler à temps.</p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors group">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Stack Audit Auto</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">Notre algorithme détecte les doublons de catégories et les outils inutilisés pour sauver votre cash.</p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* SECURITY & CTA BOTTOM */}
                <section className="w-full py-24 bg-background">
                    <div className="container max-w-4xl mx-auto px-4 text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-muted border border-border rounded-full mb-8">
                            <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">La sécurité au premier plan</h2>
                        <p className="text-muted-foreground mb-10">
                            Vos données financières sont chiffrées et isolées en base ("Row Level Security").
                            Nous ne nous connectons jamais à vos comptes bancaires.
                        </p>

                        <Link href="/auth/register" className="h-14 px-10 inline-flex items-center justify-center rounded-lg text-lg font-bold bg-foreground text-background hover:bg-muted-foreground transition-all shadow-lg hover:-translate-y-1">
                            Créer mon espace DevStack
                        </Link>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-border py-8 text-center text-sm tracking-tight text-muted-foreground bg-card">
                <p>© {new Date().getFullYear()} DevStack. Construit avec Next.js & TailwindCSS.</p>
            </footer>
        </div>
    )
}
