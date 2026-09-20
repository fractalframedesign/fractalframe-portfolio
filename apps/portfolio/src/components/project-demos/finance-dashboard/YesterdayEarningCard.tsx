'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/ui/tile'
import { cn } from '@/lib/utils'

type DayValue = { label: string; value: number }

type YesterdayEarningCardProps = {
  amount?: string
  days?: DayValue[]
  defaultSelected?: string
}

const defaultDays: DayValue[] = [
  { label: 'M', value: 40 },
  { label: 'T', value: 25 },
  { label: 'W', value: 55 },
  { label: 'T', value: 30 },
  { label: 'F', value: 90 },
  { label: 'S', value: 15 },
  { label: 'S', value: 10 },
]

export function YesterdayEarningCard({
  amount = 'AED 11.02',
  days = defaultDays,
  defaultSelected = 'F',
}: YesterdayEarningCardProps) {
  const [selectedIndex, setSelectedIndex] = useState(() =>
    days.findIndex((d) => d.label === defaultSelected),
  )

  return (
    <Tile className="justify-between gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-ink-muted">EARNING</span>
        <span className="text-xs font-semibold tracking-widest text-ink-muted">SHARE</span>
      </div>

      <div>
        <p className="text-2xl font-semibold">{amount}</p>
        <p className="mt-1 text-xs tracking-wide text-ink-muted">YESTERDAY</p>
      </div>

      <div className="flex items-end justify-between gap-2">
        {days.map((day, index) => {
          const isSelected = index === selectedIndex
          return (
            <button
              key={`${day.label}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="flex h-10 w-1 items-end overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.value}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  className={cn('w-full rounded-full', isSelected ? 'bg-accent-lime' : 'bg-white/25')}
                />
              </div>
              <span className={cn('text-[10px]', isSelected ? 'text-white' : 'text-ink-muted')}>
                {day.label}
              </span>
            </button>
          )
        })}
      </div>
    </Tile>
  )
}
