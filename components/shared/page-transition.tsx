"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
    const [prefersReduced, setPrefersReduced] = useState(false)

    useEffect(() => {
        setPrefersReduced(
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    )
}