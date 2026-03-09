const CRON_SECRET = process.env.CRON_SECRET || "your_cron_secret"

async function main() {
    const res = await fetch("http://localhost:3000/api/cron/exchange-rates", {
        headers: {
            Authorization: `Bearer ${CRON_SECRET}`,
        },
    })
    const data = await res.json()
    console.log(data)
}

main()