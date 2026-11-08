'use client'

import { ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { cn } from '@/components/project-demos/finance-dashboard/lib/utils'
import { Tile } from '@/components/project-demos/finance-dashboard/ui/tile'

type Period = 'monthly' | 'yearly'

type EarningsRingCardProps = {
  earning?: string
  monthly?: string
  yearly?: string
  monthlyPercent?: number
  yearlyPercent?: number
}

export function EarningsRingCard({
  earning = 'AED 7,855.10',
  monthly = 'AED 2,400',
  yearly = 'AED 14,589',
  monthlyPercent = 67,
  yearlyPercent = 54,
}: EarningsRingCardProps) {
  const [period, setPeriod] = useState<Period>('monthly')
  const percent = period === 'monthly' ? monthlyPercent : yearlyPercent

  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <Tile className="flex-row items-center justify-between gap-6">
      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-destructive"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 70, damping: 18 }}
          />
        </svg>
        <div className="absolute flex flex-col items-center gap-1">
          <ArrowUpRight className="h-4 w-4 text-destructive" />
          <span className="text-xs font-semibold tracking-widest text-muted-foreground">SHARE</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground">EARNING</p>
          <p className="text-2xl font-semibold text-destructive">{earning}</p>
        </div>

        <div className="flex gap-1 rounded-full bg-foreground/5 p-1 text-xs">
          {(['monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'flex-1 rounded-full py-1 capitalize transition-colors',
                period === p ? 'bg-foreground/15 text-foreground' : 'text-muted-foreground',
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-xs tracking-wide text-muted-foreground">MONTHLY</p>
            <p className="text-sm font-semibold">{monthly}</p>
          </div>
          <div>
            <p className="text-xs tracking-wide text-muted-foreground">YEARLY</p>
            <p className="text-sm font-semibold">{yearly}</p>
          </div>
        </div>
      </div>
    </Tile>
  )
}
