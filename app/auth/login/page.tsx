"use client"

import { Suspense } from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { BarChart3, Loader2 } from "lucide-react"

// ── Composant interne qui utilise useSearchParams ──────────────
function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true)
        setErrorMsg("")
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            })
            if (res?.error) {
                setErrorMsg("Email ou mot de passe incorrect.")
            } else {
                const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
                router.push(callbackUrl)
                router.refresh()
            }
        } catch {
            setErrorMsg("Une erreur inattendue est survenue.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md text-center font-medium">
                    {errorMsg}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Adresse email</label>
                <input
                    type="email"
                    disabled={isLoading}
                    placeholder="dev@example.com"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                    {...form.register("email")}
                />
                {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none">Mot de passe</label>
                    <Link href="#" className="text-xs text-primary hover:underline" tabIndex={-1}>
                        Oublié ?
                    </Link>
                </div>
                <input
                    type="password"
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                    {...form.register("password")}
                />
                {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 px-4 py-2 mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Connexion..." : "Se connecter"}
            </button>
        </form>
    )
}

// ── Page principale avec Suspense ──────────────────────────────
export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50 -z-10" />

            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-card/95">
                <div className="p-8 space-y-8">

                    <div className="flex flex-col items-center space-y-2 text-center">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-sm">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Bon retour sur DevStack</h1>
                        <p className="text-sm text-muted-foreground">Entrez vos identifiants pour accéder à votre espace.</p>
                    </div>

                    {/* Suspense obligatoire autour de useSearchParams */}
                    <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded-md" />}>
                        <LoginForm />
                    </Suspense>

                    <p className="text-center text-sm text-muted-foreground">
                        Pas encore de compte ?{" "}
                        <Link href="/auth/register" className="font-semibold text-foreground hover:underline">
                            Créer un espace gratuit
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    )
}