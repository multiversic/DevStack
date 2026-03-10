import { LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth"

export function LogoutButton() {
    return (
        <form action={logout}>
            <button
                type="submit"
                className="rounded-md p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Se déconnecter"
            >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Se déconnecter</span>
            </button>
        </form>
    )
}

