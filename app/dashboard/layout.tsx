import { ReactNode, Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { PageTransition } from "@/components/shared/page-transition"
// import { DashboardSkeleton } from "@/components/shared/skeletons"

// Composants Icones (Lucide React)
import {
    BarChart3,
    CreditCard,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Menu,
    LogOut,
    AppWindow
} from "lucide-react"

// Import de composants UI partagés (à créer)
// import { Button } from "@/components/ui/button"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { UserNav } from "@/components/dashboard/user-nav"
// import { ThemeToggle } from "@/components/shared/theme-toggle"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    // 1. Vérification stricte de la session (Server Component)
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login")
    }

    // 2. Définition des liens de la sidebar
    const navLinks = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Vue d'ensemble" },
        { href: "/dashboard/subscriptions", icon: AppWindow, label: "Mes abonnements" },
        { href: "/dashboard/billing", icon: CreditCard, label: "Refacturation" },
        { href: "/dashboard/audit", icon: ShieldCheck, label: "Stack Audit" },
        { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">

            {/* SIDEBAR DESKTOP (Cachée sur mobile, fixe à gauche sur md+) */}
            <aside className="hidden w-64 flex-col border-r border-border bg-card/50 md:flex">
                <div className="flex h-16 items-center border-b border-border px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <span className="text-xl">DevStack</span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {navLinks.map((link) => {
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Espace bas de sidebar : Mini profil utilisateur + Déconnexion */}
                <div className="border-t border-border p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col truncate">
                            <span className="truncate text-sm font-medium">{session.user.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>
                        </div>
                        {/* 
              On utilisera un Server Action pour le logout dans le build final, 
              ici représenté par un bouton brut pour la structure 
            */}
                        <button className="rounded-md p-2 hover:bg-destructive/10 hover:text-destructive">
                            <LogOut className="h-4 w-4" />
                            <span className="sr-only">Se déconnecter</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* HEADER MOBILE & ZONE DE CONTENU PRINCIPALE */}
            <div className="flex flex-1 flex-col">
                {/* Header visible uniquement sur mobile (Hamburger menu) */}
                <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-4 md:hidden">
                    <div className="flex items-center gap-2 font-bold tracking-tight">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <BarChart3 className="h-4 w-4" />
                        </div>
                        DevStack
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Remplacé plus tard par le composant Sheet de shadcn */}
                        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Ouvrir le menu</span>
                        </button>
                    </div>
                </header>

                {/* Section réservée au header Desktop (Breadcrumbs, Profil complet, Theme Toggle) */}
                <header className="hidden h-16 items-center justify-end gap-4 border-b border-border bg-background px-6 md:flex">
                    {/* Composants abstraits : ThemeToggle et UserDropdown */}
                    <div className="flex items-center gap-4">
                        {/* <ThemeToggle /> */}
                        <div className="h-8 w-8 rounded-full bg-accent animate-pulse" title="Menu Utilisateur"></div>
                    </div>
                </header>

                {/* Rendu dynamique de la page active (page.tsx) */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mx-auto max-w-6xl">
                        <PageTransition>
                            <Suspense >
                                {children}
                            </Suspense>
                        </PageTransition>
                    </div>
                </main>
            </div>
        </div>
    )
}
