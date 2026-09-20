'use client'

import { ShoppingBag } from 'lucide-react'
import { motion } from 'motion/react'

import { Tile } from '@/components/ui/tile'

type ShoppingBudgetCardProps = {
  remainPercent?: number
  remainAmount?: string
}

export function ShoppingBudgetCard({
  remainPercent = 64,
  remainAmount = 'AED 5,089.49',
}: ShoppingBudgetCardProps) {
  const radius = 46
  const circumference = Math.PI * radius
  const offset = circumference - (remainPercent / 100) * circumference

  return (
    <Tile className="items-center gap-4 text-center">
      <span className="self-start text-xs font-semibold tracking-widest text-ink-muted">
        SHOPPING
      </span>

      <div className="relative flex h-24 w-full items-end justify-center">
        <svg viewBox="0 0 120 66" className="h-24 w-32 overflow-visible">
          <path
            d="M 14 60 A 46 46 0 0 1 106 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-white/10"
          />
          <motion.path
            d="M 14 60 A 46 46 0 0 1 106 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-accent-1"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 60, damping: 16 }}
          />
        </svg>
        <div className="absolute bottom-1 flex flex-col items-center gap-1">
          <ShoppingBag className="h-4 w-4 text-accent-1" />
          <span className="text-[10px] tracking-wide text-ink-muted">REMAIN</span>
        </div>
      </div>

      <div className="flex w-full justify-between text-[10px] text-ink-muted">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>

      <p className="self-start text-xl font-semibold">
        {remainAmount.split('.')[0]}
        <span className="text-ink-muted">.{remainAmount.split('.')[1]}</span>
      </p>
    </Tile>
  )
}
