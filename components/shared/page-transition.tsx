"use client"

import { motion } from "framer-motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
    // Respecting the user's OS preference for reduced motion
    const prefersReduced = typeof window !== 'undefined' ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false

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
