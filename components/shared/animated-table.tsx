import * as React from "react"

export function AnimatedTableBody({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <tbody className={className}>
            {children}
        </tbody>
    )
}

export function AnimatedTableRow({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <tr className={`animate-in fade-in duration-300 fill-mode-both ${className || ''}`}>
            {children}
        </tr>
    )
}

