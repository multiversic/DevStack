"use client"

import { useRouter } from "next/navigation"

interface ClientSelectorProps {
    availableClients: string[]
    selectedClient: string
}

export function ClientSelector({ availableClients, selectedClient }: ClientSelectorProps) {
    const router = useRouter()

    return (
        <select
            id="client-select"
            value={selectedClient}
            onChange={(e) => router.push(`/billing?client=${e.target.value}`)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
            <option value="" disabled>--- Choisissez un client tagué ---</option>
            {availableClients.map(client => (
                <option key={client} value={client}>{client}</option>
            ))}
        </select>
    )
}