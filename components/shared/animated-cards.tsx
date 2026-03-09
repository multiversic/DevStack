"use client"

import { motion } from "framer-motion"
import * as React from "react"

export function AnimatedCardGroup({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                }
            }}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    )
}
