export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-muted rounded-md" />
                <div className="h-4 w-32 bg-muted rounded-md" />
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between pb-2">
                            <div className="h-4 w-24 bg-muted rounded-md" />
                            <div className="h-4 w-4 bg-muted rounded-md" />
                        </div>
                        <div className="h-8 w-32 bg-muted rounded-md mt-2" />
                        <div className="h-3 w-20 bg-muted rounded-md mt-2" />
                    </div>
                ))}
            </div>

            {/* Bottom Section Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-border bg-card p-6 h-[400px]" />
                <div className="col-span-3 rounded-xl border border-border bg-card p-6 h-[400px]" />
            </div>
        </div>
    )
}

export function SubscriptionsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-muted rounded-md" />
                    <div className="h-4 w-64 bg-muted rounded-md" />
                </div>
                <div className="h-10 w-40 bg-muted rounded-md" />
            </div>

            <div className="flex gap-4">
                <div className="h-10 flex-1 bg-muted rounded-md max-w-sm" />
                <div className="h-10 w-40 bg-muted rounded-md" />
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden hidden md:block">
                <div className="h-12 border-b border-border bg-muted/50" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 border-b border-border flex items-center px-6 gap-4">
                        <div className="h-8 w-8 bg-muted rounded-md shrink-0" />
                        <div className="h-4 w-32 bg-muted rounded-md" />
                        <div className="h-4 w-24 bg-muted rounded-md mx-6" />
                        <div className="h-4 w-16 bg-muted rounded-md mx-6" />
                        <div className="h-4 w-20 bg-muted rounded-md mx-6" />
                        <div className="h-6 w-16 bg-muted rounded-full mx-6" />
                        <div className="h-8 w-8 bg-muted rounded-md ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function BillingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded-md" />
                <div className="h-4 w-64 bg-muted rounded-md" />
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 w-full max-w-xs">
                    <div className="h-4 w-32 bg-muted rounded-md" />
                    <div className="h-10 w-full bg-muted rounded-md" />
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 rounded-xl border border-border bg-card h-[400px]" />
                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-5 h-[200px]" />
                </div>
            </div>
        </div>
    )
}

export function AuditSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded-md" />
                <div className="h-4 w-64 bg-muted rounded-md" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 rounded-xl border border-border bg-card p-6 h-[250px]" />
                <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 h-[250px]" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6 h-[300px]" />
                <div className="rounded-xl border border-border bg-card p-6 h-[300px]" />
            </div>
        </div>
    )
}
