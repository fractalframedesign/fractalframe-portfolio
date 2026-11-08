'use client'

import { Plus, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Tile } from '@/components/project-demos/finance-dashboard/ui/tile'

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
      <span className="self-start text-xs font-semibold tracking-widest text-muted-foreground">
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
              className="w-full rounded-xl border border-border bg-foreground/5 px-3 py-2 text-center text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full bg-foreground/10 p-2"
              >
                <X className="h-4 w-4" />
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
            className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {!open && <span className="text-xs tracking-wide text-muted-foreground">ADD EXPENSE</span>}
    </Tile>
  )
}
