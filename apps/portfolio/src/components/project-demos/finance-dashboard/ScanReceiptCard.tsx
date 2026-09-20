'use client'

import { Check, ScanLine } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/ui/tile'

type ScanReceiptCardProps = {
  onScan?: () => void
}

type ScanState = 'idle' | 'scanning' | 'done'

export function ScanReceiptCard({ onScan }: ScanReceiptCardProps) {
  const [state, setState] = useState<ScanState>('idle')

  function handleClick() {
    if (state !== 'idle') return
    setState('scanning')
    onScan?.()
    window.setTimeout(() => {
      setState('done')
      window.setTimeout(() => setState('idle'), 1200)
    }, 900)
  }

  return (
    <Tile className="items-center justify-center gap-4 text-center">
      <span className="self-start text-xs font-semibold tracking-widest text-ink-muted">
        SHARE
      </span>

      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10"
      >
        <AnimatePresence mode="wait" initial={false}>
          {state === 'idle' && (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanLine className="h-6 w-6" />
            </motion.span>
          )}
          {state === 'scanning' && (
            <motion.span
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { repeat: Infinity, duration: 0.8, ease: 'linear' } }}
            >
              <ScanLine className="h-6 w-6" />
            </motion.span>
          )}
          {state === 'done' && (
            <motion.span
              key="done"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Check className="h-6 w-6 text-accent-lime" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <span className="text-xs tracking-wide text-ink-muted">
        {state === 'done' ? 'RECEIPT SAVED' : 'SCAN RECEIPT'}
      </span>
    </Tile>
  )
}
