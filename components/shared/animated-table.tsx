"use client"

import { motion } from "framer-motion"
import * as React from "react"

export function AnimatedTableBody({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.tbody
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                }
            }}
        >
            {children}
        </motion.tbody>
    )
}

export function AnimatedTableRow({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.tr
            className={className}
            variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
            }}
        >
            {children}
        </motion.tr>
    )
}
