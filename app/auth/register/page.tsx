"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { signIn } from "next-auth/react"

import { BarChart3, Loader2 } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            currency: "XOF" // Mapping avec le select (Devise imposée XOF mais modifiable)
        }
    })

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true)
        setErrorMsg("")

        try {
            // 1. Appel Server API d'inscription
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "L'inscription a échoué.")
            }

            // 2. Auto-login silencieux si l'inscription réussit
            const signInRes = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            })

            if (signInRes?.error) {
                router.push("/auth/login?registered=true")
            } else {
                router.push("/dashboard")
                router.refresh()
            }

        } catch (e: any) {
            setErrorMsg(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>

            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-6">

                    <div className="flex flex-col items-center space-y-2 text-center text-foreground">
                        <Link href="/" className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-lg mb-2 cursor-pointer hover:bg-primary/90 transition">
                            <BarChart3 className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">Créez votre compte</h1>
                        <p className="text-sm text-muted-foreground">Prenez le contrôle absolu de votre stack d'outils.</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {errorMsg && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md text-center font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Nom complet</label>
                            <input
                                type="text"
                                disabled={isLoading}
                                placeholder="John Doe"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                {...form.register("name")}
                            />
                            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Email professionnel</label>
                            <input
                                type="email"
                                disabled={isLoading}
                                placeholder="john@example.com"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                {...form.register("email")}
                            />
                            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Mot de passe</label>
                            <input
                                type="password"
                                disabled={isLoading}
                                placeholder="••••••••"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                {...form.register("password")}
                            />
                            {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Devise de référence</label>
                            <select
                                disabled={isLoading}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                {...form.register("currency")}
                            >
                                <option value="XOF">Franc CFA (XOF)</option>
                                <option value="XAF">Franc CFA (XAF)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">Dollar ($)</option>
                                <option value="MAD">Dirham (MAD)</option>
                            </select>
                            {form.formState.errors.currency && <p className="text-xs text-destructive">{form.formState.errors.currency.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-10 px-4 py-2 mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Création en cours..." : "S'inscrire gratuitement"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground border-t border-border pt-6 mt-6">
                        Vous avez déjà un compte ?{" "}
                        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                            Connectez-vous
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    )
}
