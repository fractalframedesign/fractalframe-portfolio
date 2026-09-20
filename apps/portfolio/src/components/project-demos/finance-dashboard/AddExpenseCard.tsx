'use client'

import { Plus, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/ui/tile'

type AddExpenseCardProps = {
  onAddExpense?: (amount: number) => void
}

export function AddExpenseCard({ onAddExpense }: AddExpenseCardProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const value = Number.parseFloat(amount)
    if (!Number.isNaN(value) && value > 0) {
      onAddExpense?.(value)
    }
    setAmount('')
    setOpen(false)
  }

  return (
    <Tile className="items-center justify-center gap-4 text-center">
      <span className="self-start text-xs font-semibold tracking-widest text-ink-muted">
        SHARE
      </span>

      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center gap-2"
          >
            <input
              autoFocus
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="AED 0.00"
              className="w-full rounded-xl border border-surface-border bg-white/5 px-3 py-2 text-center text-sm outline-none focus:border-accent-1"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-full bg-accent-1 px-4 py-1.5 text-xs font-semibold"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full bg-white/10 p-1.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            key="button"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {!open && <span className="text-xs tracking-wide text-ink-muted">ADD EXPENSE</span>}
    </Tile>
  )
}
