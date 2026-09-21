'use client'

import { motion } from 'motion/react'

import { Tile } from '@/components/ui/tile'

type BudgetUsedCardProps = {
  savedToday?: string
  usedPercent?: number
}

export function BudgetUsedCard({
  savedToday = 'AED 1,470',
  usedPercent = 64,
}: BudgetUsedCardProps) {
  return (
    <Tile tone="violet" className="justify-between gap-4">
      <div>
        <p className="text-2xl font-semibold">{savedToday}</p>
        <p className="mt-1 text-xs tracking-wide text-white/70">SAVED TODAY</p>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${usedPercent}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="h-full rounded-full bg-accent-2"
        />
      </div>

      <div>
        <p className="text-3xl font-bold">{usedPercent}%</p>
        <p className="mt-1 text-xs tracking-wide text-white/70">USED FROM BUDGET</p>
      </div>
    </Tile>
  )
}
