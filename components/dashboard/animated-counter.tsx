"use client"

import * as React from "react"
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

    const [count, setCount] = useState(0)
    const [isClient, setIsClient] = useState(false)
    const prefersReduced = typeof window !== 'undefined' ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (prefersReduced) {
            setCount(value)
            return
        }

        let start = 0
        const end = value
        if (start === end) {
            setCount(value)
            return
        }

        let startTime: number | null = null
        let animationFrame: number

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            // ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3)
            setCount(progress === 1 ? end : start + (end - start) * easeProgress)

            if (progress < 1) {
                animationFrame = window.requestAnimationFrame(step)
            }
        }

        animationFrame = window.requestAnimationFrame(step)

        return () => {
            if (animationFrame) window.cancelAnimationFrame(animationFrame)
        }
    }, [value, duration, prefersReduced])

    const displayValue = currency
        ? formatCurrency(isClient ? count : value, currency)
        : Math.round(isClient ? count : value).toString()

    return (
        <span className={className}>
            {displayValue}
        </span>
    )
}

