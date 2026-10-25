'use client'

import { motion } from 'motion/react'

import { useMotion } from '@/components/project-demos/fintech-components/motion/settings'
import { cn } from '@/lib/utils'

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number
  className?: string
  indicatorClassName?: string
}) {
  const clamped = Math.min(100, Math.max(0, value))
  const m = useMotion()
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      {m.enabled ? (
        // Studio motion: fills from empty when it appears, then eases to new values
        <motion.div
          className={cn('h-full rounded-full bg-primary', indicatorClassName)}
          initial={{ width: '0%' }}
          animate={{ width: `${clamped}%` }}
          transition={m.tween(700, 120)}
        />
      ) : (
        <div
          className={cn('h-full rounded-full bg-primary transition-[width] duration-500 ease-out', indicatorClassName)}
          style={{ width: `${clamped}%` }}
        />
      )}
    </div>
  )
}
