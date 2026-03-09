"use client"

import * as React from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface AnimatedCounterProps {
    value: number
    duration?: number // in ms, defaults to 800
    currency?: string // Optional currency for formatting
    className?: string
}

export function AnimatedCounter({
    value,
    duration = 800,
    currency,
    className = ""
}: AnimatedCounterProps) {

    const [isClient, setIsClient] = useState(false)
    const prefersReduced = typeof window !== 'undefined' ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Animation values
    const springValue = useSpring(0, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    // Start animation when value changes
    useEffect(() => {
        if (prefersReduced) {
            springValue.set(value) // Instant if reduced motion
        } else {
            springValue.set(value)
        }
    }, [value, springValue, prefersReduced])

    const display = useTransform(springValue, (current) => {
        return currency ? formatCurrency(current, currency) : Math.round(current).toString()
    })

    if (!isClient) {
        return <span className={className}>{currency ? formatCurrency(value, currency) : value}</span>
    }

    return (
        <motion.span className={className}>
            {display}
        </motion.span>
    )
}
