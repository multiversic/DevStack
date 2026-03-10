import * as React from "react"

export function AnimatedCardGroup({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={className}>
            {children}
        </div>
    )
}

export function AnimatedCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`animate-in fade-in slide-in-from-bottom-4 duration-300 hover:scale-[1.02] transition-transform ${className || ''}`}>
            {children}
        </div>
    )
}

