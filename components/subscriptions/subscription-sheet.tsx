"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"

interface Tool {
    id: string
    name: string
    category: string
    defaultPrice: number | null
    defaultCurrency: string
    logoUrl: string | null
}

interface SubscriptionSheetProps {
    catalogTools: Tool[]
}

export function SubscriptionSheet({ catalogTools }: SubscriptionSheetProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
    const router = useRouter()

    const [form, setForm] = useState({
        toolName: "",
        category: "",
        price: "",
        currency: "USD",
        frequency: "MONTHLY",
        nextPayment: "",
        clientTag: "",
        usage: "HIGH",
        note: "",
    })

    function handleToolSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        const tool = catalogTools.find(t => t.id === e.target.value)
        if (tool) {
            setSelectedTool(tool)
            setForm(f => ({
                ...f,
                toolName: tool.name,
                category: tool.category,
                price: tool.defaultPrice?.toString() || "",
                currency: tool.defaultCurrency,
            }))
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    nextPayment: new Date(form.nextPayment).toISOString(),
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Erreur lors de la création")

            setOpen(false)
            setForm({ toolName: "", category: "", price: "", currency: "USD", frequency: "MONTHLY", nextPayment: "", clientTag: "", usage: "HIGH", note: "" })
            setSelectedTool(null)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Bouton déclencheur */}
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 shadow-sm transition-colors"
            >
                <Plus className="h-4 w-4" />
                Ajouter un abonnement
            </button>

            {/* Overlay + Sheet */}
            {open && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-lg font-semibold">Nouvel abonnement</h2>
                            <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-muted transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">

                            {/* Sélection depuis catalogue */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Choisir depuis le catalogue</label>
                                <select
                                    onChange={handleToolSelect}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">— Sélectionner un outil —</option>
                                    {catalogTools.map(tool => (
                                        <option key={tool.id} value={tool.id}>{tool.name} ({tool.category})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Nom */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Nom de l'outil *</label>
                                <input
                                    required
                                    value={form.toolName}
                                    onChange={e => setForm(f => ({ ...f, toolName: e.target.value }))}
                                    placeholder="Ex: ChatGPT Plus"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            {/* Catégorie */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Catégorie *</label>
                                <input
                                    required
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    placeholder="Ex: IA, Cloud, Design..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            {/* Prix + Devise */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Prix *</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="20.00"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Devise</label>
                                    <select
                                        value={form.currency}
                                        onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="XOF">XOF</option>
                                        <option value="XAF">XAF</option>
                                        <option value="MAD">MAD</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fréquence */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Fréquence *</label>
                                <select
                                    value={form.frequency}
                                    onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="MONTHLY">Mensuel</option>
                                    <option value="YEARLY">Annuel</option>
                                    <option value="WEEKLY">Hebdomadaire</option>
                                </select>
                            </div>

                            {/* Prochain paiement */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Prochain paiement *</label>
                                <input
                                    required
                                    type="date"
                                    value={form.nextPayment}
                                    onChange={e => setForm(f => ({ ...f, nextPayment: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            {/* Client (optionnel) */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Client refacturable <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                                <input
                                    value={form.clientTag}
                                    onChange={e => setForm(f => ({ ...f, clientTag: e.target.value }))}
                                    placeholder="Ex: Acme Corp"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            {/* Utilisation */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Niveau d'utilisation</label>
                                <select
                                    value={form.usage}
                                    onChange={e => setForm(f => ({ ...f, usage: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="HIGH">Intensif</option>
                                    <option value="LOW">Occasionnel</option>
                                    <option value="UNUSED">Inutilisé</option>
                                </select>
                            </div>

                            {/* Note */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Note <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                                <textarea
                                    value={form.note}
                                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                    placeholder="Remarque sur cet abonnement..."
                                    rows={2}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 h-10 rounded-md border border-input bg-background hover:bg-accent text-sm font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Enregistrement..." : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </>
    )
}