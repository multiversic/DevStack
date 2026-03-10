"use client"

import { useEffect, useRef } from "react"

export function PageTransition({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.opacity = "0"
        el.style.transform = "translateY(8px)"
        requestAnimationFrame(() => {
            el.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out"
            el.style.opacity = "1"
            el.style.transform = "translateY(0)"
        })
    }, [])

    return (
        <div ref={ref} style={{ opacity: 0 }}>
            {children}
        </div>
    )
}