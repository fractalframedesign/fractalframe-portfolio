'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/ui/tile'
import { cn } from '@/lib/utils'

type DayValue = { label: string; value: number }

type SavingsOverviewCardProps = {
  monthlySave?: string
  monthlySpending?: string
  days?: DayValue[]
}

const defaultDays: DayValue[] = [
  { label: 'Mon', value: 55 },
  { label: 'Tue', value: 20 },
  { label: 'Wed', value: 70 },
  { label: 'Thu', value: 85 },
  { label: 'Fri', value: 45 },
  { label: 'Sat', value: 60 },
  { label: 'Sun', value: 15 },
]

export function SavingsOverviewCard({
  monthlySave = 'AED 15,900',
  monthlySpending = 'AED 12,489',
  days = defaultDays,
}: SavingsOverviewCardProps) {
  const [activeDay, setActiveDay] = useState<string | null>(null)

  return (
    <Tile className="justify-between gap-6">
      <span className="text-xs font-semibold tracking-widest text-ink-muted">SHARE</span>

      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-3">
        <div>
          <p className="flex items-baseline gap-1.5 text-2xl font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-lime" />
            {monthlySave}
          </p>
          <p className="mt-1 text-xs tracking-wide text-ink-muted">MONTHLY SAVE</p>
        </div>
        <div>
          <p className="flex items-baseline gap-1.5 text-2xl font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {monthlySpending}
          </p>
          <p className="mt-1 text-xs tracking-wide text-ink-muted">MONTHLY SPENDING</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        {days.map((day) => {
          const isActive = activeDay === day.label
          return (
            <button
              key={day.label}
              type="button"
              onClick={() => setActiveDay(isActive ? null : day.label)}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-16 w-2.5 items-end overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.value}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
                  className={cn(
                    'w-full rounded-full',
                    isActive ? 'bg-accent-lime' : 'bg-accent-lime/70',
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[11px] transition-colors',
                  isActive ? 'text-white' : 'text-ink-muted',
                )}
              >
                {day.label}
              </span>
            </button>
          )
        })}
      </div>
    </Tile>
  )
}
