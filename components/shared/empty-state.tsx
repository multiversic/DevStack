"use client"

import { motion } from "framer-motion"
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
    // Respecting the user's OS preference for reduced motion
    const prefersReduced = typeof window !== 'undefined' ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false

    return (
        <motion.div
            className={cn("flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50", className)}
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.4,
                ease: "easeOut",
                type: "spring",
                stiffness: 260,
                damping: 20
            }}
        >
            <motion.div
                className="h-12 w-12 rounded-full bg-accent text-muted-foreground flex items-center justify-center mb-4"
                initial={{ y: prefersReduced ? 0 : 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            >
                <Icon className="h-6 w-6" />
            </motion.div>
            <motion.h3
                className="text-lg font-semibold tracking-tight"
                initial={{ y: prefersReduced ? 0 : 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            >
                {title}
            </motion.h3>
            <motion.p
                className="text-sm text-muted-foreground mt-1 max-w-sm mb-6"
                initial={{ y: prefersReduced ? 0 : 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
            >
                {description}
            </motion.p>
            {children && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                >
                    {children}
                </motion.div>
            )}
        </motion.div>
    )
}
