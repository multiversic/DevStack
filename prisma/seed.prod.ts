import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("💱 Seed production — taux de change...")

    const rates = [
        { currency: "USD", rate: 1.00 },
        { currency: "EUR", rate: 0.92 },
        { currency: "XOF", rate: 603.50 },
        { currency: "XAF", rate: 603.50 },
        { currency: "MAD", rate: 10.05 },
    ]

    for (const r of rates) {
        await prisma.exchangeRate.upsert({
            where: { currency: r.currency },
            update: { rate: r.rate },
            create: { currency: r.currency, rate: r.rate },
        })
    }

    console.log("✅ Taux de change insérés.")
}

main()
    .catch((e) => {
        console.error("❌ Erreur :", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })