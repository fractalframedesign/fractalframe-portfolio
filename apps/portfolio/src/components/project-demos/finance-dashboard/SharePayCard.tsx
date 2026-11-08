'use client'

import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/project-demos/finance-dashboard/ui/tile'

type SharePayCardProps = {
  last4?: string
  balance?: string
}

export function SharePayCard({ last4 = '2422', balance = 'AED 5,089.00' }: SharePayCardProps) {
  const [revealed, setRevealed] = useState(true)

  return (
    <Tile className="justify-between gap-6 overflow-hidden bg-gradient-to-br from-primary/30 to-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide">SHAREPay</span>
        <span className="text-xs text-foreground/60">**** {last4}</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-foreground/70">SHARE Pay</p>
          <p className="text-xs text-foreground/50">**** {last4}</p>
        </div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="rounded-full bg-foreground/10 p-2"
            aria-label={revealed ? 'Hide balance' : 'Show balance'}
          >
            {revealed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </motion.div>
      </div>

      <div>
        <p className="text-xs tracking-wide text-foreground/60">BALANCE</p>
        <p className="mt-1 text-xl font-semibold">{revealed ? balance : 'AED ••••.••'}</p>
      </div>
    </Tile>
  )
}
