import { ReactNode, Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { PageTransition } from "@/components/shared/page-transition"
import { DashboardSkeleton } from "@/components/shared/skeletons"

import {
    BarChart3,
    CreditCard,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Menu,
    AppWindow
} from "lucide-react"

// Import de composants UI partagés
import { MobileNav } from "@/components/layout/mobile-nav"
import { DesktopNav } from "@/components/layout/desktop-nav"
import { LogoutButton } from "@/components/layout/logout-button"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    // 1. Vérification stricte de la session (Server Component)
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login")
    }

    // Les liens de la sidebar ont été déplacés dans DesktopNav et MobileNav

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

                <DesktopNav />

                {/* Espace bas de sidebar : Mini profil utilisateur + Déconnexion */}
                <div className="border-t border-border p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col truncate">
                            <span className="truncate text-sm font-medium">{session.user.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>
                        </div>
                        <LogoutButton />
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
                        <MobileNav />
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
                            <Suspense fallback={<DashboardSkeleton />}>
                                {children}
                            </Suspense>
                        </PageTransition>
                    </div>
                </main>
            </div>
        </div>
    )
}
