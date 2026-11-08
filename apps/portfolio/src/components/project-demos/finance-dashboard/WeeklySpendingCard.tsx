'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/project-demos/finance-dashboard/ui/tile'
import { cn } from '@/components/project-demos/finance-dashboard/lib/utils'

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
              <div className="flex h-16 w-2 items-end overflow-hidden rounded-full bg-foreground/5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.value}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  className={cn('w-full rounded-full', isSelected ? 'bg-destructive' : 'bg-foreground/25')}
                />
              </div>
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isSelected ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground',
                )}
              >
                {day.label}
              </span>
            </button>
          )
        })}
      </div>

      <div>
        <p className="text-xs tracking-wide text-muted-foreground">THIS WEEK SPENDING</p>
        <p className="mt-1 text-xl font-semibold">{total}</p>
      </div>
    </Tile>
  )
}
