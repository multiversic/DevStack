import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Resend } from "resend"

// Initialisation de Resend (nécessite RESEND_API_KEY dans le .env)
const resend = new Resend(process.env.RESEND_API_KEY)

// Sécurisation de la route pour qu'elle ne soit appelable que par Vercel Cron
function isAuthorized(request: Request) {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Normalisation à minuit UTC pour comparaison propre

        // Définition des bornes de vérification (aujourd'hui, J+1, J+3, J+7)
        const targets = [
            { type: "D0", days: 0 },
            { type: "D1", days: 1 },
            { type: "D3", days: 3 },
            { type: "D7", days: 7 },
        ] as const

        const results = []

        for (const target of targets) {
            const targetDate = new Date(today)
            targetDate.setDate(targetDate.getDate() + target.days)

            // Recherche des abonnements actifs dont la date de paiement correspond EXACTEMENT au jour cible
            const subscriptions = await db.subscription.findMany({
                where: {
                    isActive: true,
                    nextPayment: {
                        gte: targetDate,
                        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) // +1 jour
                    },
                    // ET pour lesquels on n'a PAS encore envoyé ce type précis de rappel
                    reminders: {
                        none: { type: target.type }
                    }
                },
                include: { user: true } // Joindre l'user pour avoir l'email et la devise
            })

            // Traitement et envoi par lot (batch)
            for (const sub of subscriptions) {
                try {
                    // 1. Envoi de l'email via Resend (utilise le composant React Email généré plus tard)
                    const htmlContent = `
            <h2>Rappel : Votre abonnement ${sub.toolName}</h2>
            <p>Bonjour ${sub.user.name},</p>
            <p>Nous vous rappelons que votre abonnement <strong>${sub.toolName}</strong> sera prélevé ${target.days === 0 ? "aujourd'hui" : `dans ${target.days} jours`}.</p>
            <p><strong>Montant prélevé :</strong> ${sub.price} ${sub.currency}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/subscriptions">Gérer mes abonnements</a></p>
          `

                    await resend.emails.send({
                        from: "DevStack <reminders@devstack.app>", // Doit être configuré sur Resend
                        to: sub.user.email,
                        subject: `Rappel : ${sub.toolName} sera prélevé ${target.days === 0 ? "aujourd'hui" : `dans ${target.days} jours`} (${sub.price} ${sub.currency})`,
                        html: htmlContent,
                    })

                    // 2. Enregistrement du log en BD pour éviter les doublons le landemain matin si cron glitch
                    await db.reminderLog.create({
                        data: {
                            subscriptionId: sub.id,
                            type: target.type,
                            channel: "EMAIL"
                        }
                    })

                    results.push({ id: sub.id, name: sub.toolName, type: target.type, status: "sent" })

                } catch (emailError) {
                    console.error(`Erreur email pour ABO_ID: ${sub.id}`, emailError)
                    results.push({ id: sub.id, name: sub.toolName, type: target.type, status: "failed" })
                }
            }
        }

        return NextResponse.json({
            succes: true,
            processed: results.length,
            details: results
        }, { status: 200 })

    } catch (error) {
        console.error("[CRON_REMINDERS_ERROR]", error)
        return NextResponse.json({ error: "Erreur interne du cron" }, { status: 500 })
    }
}

export const runtime = "nodejs"
