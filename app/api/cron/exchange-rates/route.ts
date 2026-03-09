import { NextResponse } from "next/server"
import { db } from "@/lib/db"

function isAuthorized(request: Request) {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const APP_ID = process.env.OPEN_EXCHANGE_APP_ID

    if (!APP_ID) {
        console.error("Clé OPEN_EXCHANGE_APP_ID manquante")
        return NextResponse.json({ error: "Configuration API devise manquante" }, { status: 500 })
    }

    try {
        // Appel direct via fetch natif (Next.js gère la déduplication et le runtime Edge/Node)
        const exRequest = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${APP_ID}&base=USD`)

        if (!exRequest.ok) {
            throw new Error(`Erreur API OER: ${exRequest.statusText}`)
        }

        const data = await exRequest.json()
        const rates = data.rates // Un objet clé/valeur { "EUR": 0.92, "XOF": 603.50, ... }

        // On ne met à jour que les devises utiles pour DevStack (MVP = XOF, XAF, EUR, USD, MAD)
        const targetCurrencies = ["XOF", "XAF", "EUR", "USD", "MAD"]

        const updates = []
        for (const currency of targetCurrencies) {
            if (rates[currency]) {
                // Upsert : met à jour le taux si la devise existe en BD, la crée sinon
                const upsertRate = await db.exchangeRate.upsert({
                    where: { currency: currency },
                    update: { rate: rates[currency] },
                    create: { currency: currency, rate: rates[currency] },
                })
                updates.push(upsertRate)
            }
        }

        return NextResponse.json({
            success: true,
            message: `${updates.length} taux de change mis à jour avec succès depuis la base USD.`
        }, { status: 200 })

    } catch (error) {
        console.error("[CRON_EXCHANGES_ERROR]", error)
        return NextResponse.json({ error: "Impossible de synchroniser les devises" }, { status: 500 })
    }
}
