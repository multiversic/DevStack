import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Utilisation de Clearbit pour mock facilement 40+ logos
const getLogo = (domain: string) => `https://logo.clearbit.com/${domain}`

async function main() {
    console.log("🌱 Début du seed du catalogue des outils...")

    // Nettoyage préalable optionnel
    await prisma.toolCatalog.deleteMany()

    const tools = [
        // --- IAs ---
        { name: "ChatGPT Plus", category: "IAs", website: "openai.com", defaultPrice: 20, defaultCurrency: "USD" },
        { name: "Claude Pro", category: "IAs", website: "anthropic.com", defaultPrice: 20, defaultCurrency: "USD" },
        { name: "Midjourney", category: "IAs", website: "midjourney.com", defaultPrice: 10, defaultCurrency: "USD" },
        { name: "Perplexity Pro", category: "IAs", website: "perplexity.ai", defaultPrice: 20, defaultCurrency: "USD" },
        { name: "GitHub Copilot", category: "IAs", website: "github.com", defaultPrice: 10, defaultCurrency: "USD" },
        { name: "Cursor Pro", category: "IAs", website: "cursor.sh", defaultPrice: 20, defaultCurrency: "USD" },
        { name: "Gemini Advanced", category: "IAs", website: "gemini.google.com", defaultPrice: 20, defaultCurrency: "USD" },
        { name: "Runway", category: "IAs", website: "runwayml.com", defaultPrice: 15, defaultCurrency: "USD" },

        // --- Cloud & Hosting ---
        { name: "Vercel Pro", category: "Cloud & Hosting", website: "vercel.com", defaultPrice: 20, defaultCurrency: "USD" },
        { name: "Netlify Pro", category: "Cloud & Hosting", website: "netlify.com", defaultPrice: 19, defaultCurrency: "USD" },
        { name: "Railway", category: "Cloud & Hosting", website: "railway.app", defaultPrice: 5, defaultCurrency: "USD" },
        { name: "DigitalOcean", category: "Cloud & Hosting", website: "digitalocean.com", defaultPrice: 6, defaultCurrency: "USD" },
        { name: "AWS", category: "Cloud & Hosting", website: "aws.amazon.com", defaultPrice: null, defaultCurrency: "USD" },
        { name: "Supabase Pro", category: "Cloud & Hosting", website: "supabase.com", defaultPrice: 25, defaultCurrency: "USD" },
        { name: "Fly.io", category: "Cloud & Hosting", website: "fly.io", defaultPrice: null, defaultCurrency: "USD" },
        { name: "Cloudflare Pro", category: "Cloud & Hosting", website: "cloudflare.com", defaultPrice: 20, defaultCurrency: "USD" },

        // --- Dev Tools ---
        { name: "GitHub Pro", category: "Dev Tools", website: "github.com", defaultPrice: 4, defaultCurrency: "USD" },
        { name: "GitLab Premium", category: "Dev Tools", website: "gitlab.com", defaultPrice: 19, defaultCurrency: "USD" },
        { name: "Linear", category: "Dev Tools", website: "linear.app", defaultPrice: 8, defaultCurrency: "USD" },
        { name: "Sentry", category: "Dev Tools", website: "sentry.io", defaultPrice: 26, defaultCurrency: "USD" },
        { name: "Datadog", category: "Dev Tools", website: "datadoghq.com", defaultPrice: 15, defaultCurrency: "USD" },
        { name: "Postman", category: "Dev Tools", website: "postman.com", defaultPrice: 14, defaultCurrency: "USD" },
        { name: "TablePlus", category: "Dev Tools", website: "tableplus.com", defaultPrice: 89, defaultCurrency: "USD" }, // Note: Annuel normalement, mais stocké tel quel.

        // --- Design ---
        { name: "Figma Pro", category: "Design", website: "figma.com", defaultPrice: 15, defaultCurrency: "USD" },
        { name: "Framer", category: "Design", website: "framer.com", defaultPrice: 15, defaultCurrency: "USD" },
        { name: "Adobe CC", category: "Design", website: "adobe.com", defaultPrice: 55, defaultCurrency: "EUR" },
        { name: "Canva Pro", category: "Design", website: "canva.com", defaultPrice: 13, defaultCurrency: "USD" },

        // --- Productivité ---
        { name: "Notion Plus", category: "Productivité", website: "notion.so", defaultPrice: 10, defaultCurrency: "USD" },
        { name: "Obsidian Sync", category: "Productivité", website: "obsidian.md", defaultPrice: 8, defaultCurrency: "USD" },
        { name: "Loom", category: "Productivité", website: "loom.com", defaultPrice: 12, defaultCurrency: "USD" },
        { name: "1Password", category: "Productivité", website: "1password.com", defaultPrice: 3, defaultCurrency: "USD" },
        { name: "Zoom Pro", category: "Productivité", website: "zoom.us", defaultPrice: 14, defaultCurrency: "USD" },

        // --- Email & Marketing ---
        { name: "Resend Pro", category: "Email & Marketing", website: "resend.com", defaultPrice: 20, defaultCurrency: "USD" },
        { name: "Mailchimp", category: "Email & Marketing", website: "mailchimp.com", defaultPrice: 13, defaultCurrency: "USD" },
        { name: "ConvertKit", category: "Email & Marketing", website: "convertkit.com", defaultPrice: 9, defaultCurrency: "USD" },
        { name: "Beehiiv", category: "Email & Marketing", website: "beehiiv.com", defaultPrice: 39, defaultCurrency: "USD" },

        // --- Analytics ---
        { name: "Mixpanel", category: "Analytics", website: "mixpanel.com", defaultPrice: 20, defaultCurrency: "USD" },
        { name: "PostHog Cloud", category: "Analytics", website: "posthog.com", defaultPrice: 0, defaultCurrency: "USD" },
        { name: "Fathom", category: "Analytics", website: "usefathom.com", defaultPrice: 14, defaultCurrency: "USD" },
        { name: "Plausible", category: "Analytics", website: "plausible.io", defaultPrice: 9, defaultCurrency: "EUR" },

        // --- Autres ---
        { name: "Stripe", category: "Autres", website: "stripe.com", defaultPrice: null, defaultCurrency: "USD" },
        { name: "Twilio", category: "Autres", website: "twilio.com", defaultPrice: null, defaultCurrency: "USD" },
        { name: "Airtable", category: "Autres", website: "airtable.com", defaultPrice: 10, defaultCurrency: "USD" },
        { name: "Zapier", category: "Autres", website: "zapier.com", defaultPrice: 19, defaultCurrency: "USD" },
    ]

    console.log(`Insertion de ${tools.length} outils dans le catalogue...`)

    for (const t of tools) {
        await prisma.toolCatalog.create({
            data: {
                name: t.name,
                category: t.category,
                website: t.website,
                defaultPrice: t.defaultPrice,
                defaultCurrency: t.defaultCurrency,
                logoUrl: getLogo(t.website),
            },
        })
    }

    // --- Insertion dynamique des Devises par défaut (Fake/Mock) ---
    console.log("Insertion des taux de change (Base = USD) temporaires...")
    const initialRates = [
        { currency: "EUR", rate: 0.92 },
        { currency: "XOF", rate: 603.50 }, // Franc CFA BCEAO
        { currency: "XAF", rate: 603.50 }, // Franc CFA BEAC
        { currency: "MAD", rate: 10.05 },  // Dirham marocain
        { currency: "USD", rate: 1.00 },   // Base
    ]

    for (const r of initialRates) {
        await prisma.exchangeRate.upsert({
            where: { currency: r.currency },
            update: { rate: r.rate },
            create: { currency: r.currency, rate: r.rate },
        })
    }

    console.log("✅ Seed terminé avec succès !")
}

main()
    .catch((e) => {
        console.error("❌ Erreur pendant le seed :", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
