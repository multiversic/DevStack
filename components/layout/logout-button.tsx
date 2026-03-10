"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

export function LogoutButton() {
    const [isPending, setIsPending] = useState(false)

    const handleLogout = async () => {
        setIsPending(true)
        await signOut({ callbackUrl: "/auth/login" })
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isPending}
            className="rounded-md p-2 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Se déconnecter"
        >
            <LogOut className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            <span className="sr-only">Se déconnecter</span>
        </button>
    )
}

