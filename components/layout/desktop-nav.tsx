"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    CreditCard,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    AppWindow
} from "lucide-react"

const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Vue d'ensemble" },
    { href: "/dashboard/subscriptions", icon: AppWindow, label: "Mes abonnements" },
    { href: "/dashboard/billing", icon: CreditCard, label: "Refacturation" },
    { href: "/dashboard/audit", icon: ShieldCheck, label: "Stack Audit" },
    { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
]

export function DesktopNav() {
    const pathname = usePathname()

    return (
        <nav className="flex-1 space-y-1 p-4">
            {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard")

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                )
            })}
        </nav>
    )
}
