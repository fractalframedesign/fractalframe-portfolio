'use client'

import { Leaf } from 'lucide-react'
import { motion } from 'motion/react'

import { Tile } from '@/components/ui/tile'

type GroceriesSpendingCardProps = {
  total?: string
  bars?: number[]
}

const defaultBars = [30, 45, 55, 65, 78, 100]

export function GroceriesSpendingCard({
  total = 'AED 764.00',
  bars = defaultBars,
}: GroceriesSpendingCardProps) {
  return (
    <Tile tone="rose" className="justify-between gap-6">
      <div className="flex items-center gap-2">
        <Leaf className="h-4 w-4" />
        <span className="text-sm font-semibold">Groceries</span>
      </div>

      <div className="flex h-12 items-end justify-end gap-1.5">
        {bars.map((value, index) => (
          <div key={index} className="flex h-full w-2.5 items-end overflow-hidden rounded-full bg-white/15">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              transition={{ type: 'spring', stiffness: 110, damping: 16, delay: index * 0.04 }}
              className={index === bars.length - 1 ? 'w-full rounded-full bg-white' : 'w-full rounded-full bg-white/50'}
            />
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs tracking-wide text-white/70">THIS WEEK SPENDING</p>
        <p className="mt-1 text-xl font-semibold">{total}</p>
      </div>
    </Tile>
  )
}
