import type { Metadata } from "next"
// Import de Geist depuis locales ou externe (Remplaçant Inter). Note: next/font/google ou geist.
// On simplifie avec Inter pour éviter les erreurs d'installation si geist non disponible.
import { Inter } from "next/font/google"
import "./globals.css" // Pointant vers le Tailwind généré

import { ThemeProvider } from "@/components/shared/theme-provider"
import { AuthProvider } from "@/components/shared/auth-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "DevStack | Le Dashboard des Développeurs",
    description: "Suivez, refacturez et optimisez vos abonnements SaaS et Cloud de développeur.",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        // suppressHydrationWarning est obligatoire avec `next-themes` pour éviter l'erreur de mismatch DOM/Serveur
        <html lang="fr" suppressHydrationWarning className={inter.className}>
            <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">

                {/* Force le Dark Mode par défaut comme demandé, avec toggle possible */}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {children}
                        {/* Notifications globales Sonner */}
                        <Toaster theme="dark" position="bottom-right" richColors />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
