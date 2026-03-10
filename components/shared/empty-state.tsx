import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    className?: string
    children?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, className, children }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50",
                "animate-in fade-in-0 zoom-in-95 duration-300",
                className
            )}
        >
            <div className="h-12 w-12 rounded-full bg-accent text-muted-foreground flex items-center justify-center mb-4">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-6">{description}</p>
            {children && <div>{children}</div>}
        </div>
    )
}