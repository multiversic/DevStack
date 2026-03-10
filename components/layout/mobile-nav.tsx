"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
    BarChart3,
    CreditCard,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Menu,
    AppWindow
} from "lucide-react"

const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Vue d'ensemble" },
    { href: "/dashboard/subscriptions", icon: AppWindow, label: "Mes abonnements" },
    { href: "/dashboard/billing", icon: CreditCard, label: "Refacturation" },
    { href: "/dashboard/audit", icon: ShieldCheck, label: "Stack Audit" },
    { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
]

export function MobileNav() {
    const [open, setOpen] = React.useState(false)
    const pathname = usePathname()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Ouvrir le menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]" aria-describedby="mobile-nav-description">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <SheetDescription id="mobile-nav-description" className="sr-only">
                    Menu contenant les liens vers les principales sections du tableau de bord.
                </SheetDescription>
                <div className="flex h-16 items-center border-b border-border mb-4">
                    <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 font-bold tracking-tight"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <span className="text-xl">DevStack</span>
                    </Link>
                </div>

                <nav className="flex flex-col space-y-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard")

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={`flex flex-row items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    )
}
