'use client'

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/ui/tile'

type SendReceiveCardProps = {
  onSend?: () => void
  onReceive?: () => void
}

export function SendReceiveCard({ onSend, onReceive }: SendReceiveCardProps) {
  const [status, setStatus] = useState<string | null>(null)

  function trigger(action: 'send' | 'receive') {
    setStatus(action === 'send' ? 'Sent!' : 'Requested!')
    if (action === 'send') onSend?.()
    else onReceive?.()
    window.setTimeout(() => setStatus(null), 1200)
  }

  return (
    <Tile className="justify-between gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-ink-muted">SHARE</span>
        <AnimatePresence>
          {status && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-medium text-accent-2"
            >
              {status}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => trigger('send')}
          className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/10"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold tracking-wide">SEND</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => trigger('receive')}
          className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/10"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-3">
            <ArrowDownLeft className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold tracking-wide">RECEIVE</span>
        </motion.button>
      </div>
    </Tile>
  )
}
