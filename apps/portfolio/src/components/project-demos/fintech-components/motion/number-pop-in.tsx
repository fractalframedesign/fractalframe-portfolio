'use client'

import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

import { useMotion } from './settings'

/**
 * With motion enabled, re-enters each character with a short rise and blur
 * whenever the value changes; the last two characters (cents, decimals)
 * follow with a stagger. With motion off it renders the plain value.
 */
export function NumberPopIn({ value, className }: { value: string; className?: string }) {
  const m = useMotion()
  const chars = Array.from(value)

  if (!m.enabled) return <span className={className}>{value}</span>

  return (
    <span className={cn('inline-flex', className)} aria-label={value} role="text">
      {chars.map((char, index) => {
        const fromEnd = chars.length - 1 - index
        const staggerStep = fromEnd < 2 ? 2 - fromEnd : 0
        return (
          <motion.span
            // Key on the value so a new number re-runs the pop-in
            key={`${value}-${index}`}
            aria-hidden
            className="inline-block whitespace-pre"
            initial={{ opacity: 0, y: m.distance, filter: `blur(${m.blur}px)` }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={m.tween(500, staggerStep * m.stagger)}
          >
            {char}
          </motion.span>
        )
      })}
    </span>
  )
}
