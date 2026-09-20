'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/ui/tile'
import { cn } from '@/lib/utils'

type DayValue = { label: string; value: number }

type WeeklySpendingCardProps = {
  total?: string
  days?: DayValue[]
  defaultSelected?: string
}

const defaultDays: DayValue[] = [
  { label: 'M', value: 70 },
  { label: 'T', value: 55 },
  { label: 'W', value: 40 },
  { label: 'T', value: 45 },
  { label: 'F', value: 95 },
  { label: 'S', value: 20 },
  { label: 'S', value: 15 },
]

export function WeeklySpendingCard({
  total = 'AED 764.00',
  days = defaultDays,
  defaultSelected = 'F',
}: WeeklySpendingCardProps) {
  const [selectedIndex, setSelectedIndex] = useState(() =>
    days.findIndex((d) => d.label === defaultSelected),
  )

  return (
    <Tile className="justify-between gap-4">
      <div className="flex items-end justify-between gap-2">
        {days.map((day, index) => {
          const isSelected = index === selectedIndex
          return (
            <button
              key={`${day.label}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-16 w-1.5 items-end overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.value}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  className={cn('w-full rounded-full', isSelected ? 'bg-accent-3' : 'bg-white/25')}
                />
              </div>
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                  isSelected ? 'bg-accent-3 text-white' : 'text-ink-muted',
                )}
              >
                {day.label}
              </span>
            </button>
          )
        })}
      </div>

      <div>
        <p className="text-xs tracking-wide text-ink-muted">THIS WEEK SPENDING</p>
        <p className="mt-1 text-xl font-semibold">{total}</p>
      </div>
    </Tile>
  )
}
