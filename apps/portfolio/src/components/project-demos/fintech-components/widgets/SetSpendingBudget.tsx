'use client'

import * as React from 'react'

import { Badge } from '@/components/project-demos/fintech-components/ui/badge'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

function IconDots({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
      <circle cx="6" cy="12" r="1.25" fill="currentColor" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" />
    </svg>
  )
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M12.15 19.25H8.35C4.77 19.25 2.98 19.25 1.86 18.14C0.75 17.03 0.75 15.24 0.75 11.66V9.76C0.75 6.19 0.75 4.4 1.86 3.28C2.98 2.17 4.77 2.17 8.35 2.17H12.15C15.73 2.17 17.52 2.17 18.64 3.28C19.75 4.4 19.75 6.19 19.75 9.76V11.66C19.75 15.24 19.75 17.03 18.64 18.14C18.02 18.76 17.19 19.03 15.95 19.15M5.5 2.17V0.75M15 2.17V0.75M19.28 6.92H9.06M0.75 6.92H4.43"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="15" cy="14.5" r="1" fill="currentColor" />
      <circle cx="15" cy="10.7" r="1" fill="currentColor" />
      <circle cx="10.25" cy="14.5" r="1" fill="currentColor" />
      <circle cx="10.25" cy="10.7" r="1" fill="currentColor" />
      <circle cx="5.5" cy="14.5" r="1" fill="currentColor" />
      <circle cx="5.5" cy="10.7" r="1" fill="currentColor" />
    </svg>
  )
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export type BudgetCycle = { id: string; label: string }
export type BudgetCategory = { id: string; name: string; amount: number }

export interface SetSpendingBudgetProps {
  title?: string
  amount?: number
  spentLast7Days?: number
  cycles?: BudgetCycle[]
  categories?: BudgetCategory[]
  loading?: boolean
  className?: string
}

const DEFAULT_CYCLES: BudgetCycle[] = [
  { id: 'weekly-fri', label: 'Weekly on Friday' },
  { id: 'biweekly-fri', label: 'Biweekly on Friday' },
  { id: 'monthly-1', label: 'Monthly on the 1st' },
]

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: 'groceries', name: 'Groceries', amount: 150 },
  { id: 'transport', name: 'Transport', amount: 80 },
  { id: 'entertainment', name: 'Entertainment', amount: 120 },
  { id: 'shopping', name: 'Shopping', amount: 150 },
]

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function SetSpendingBudgetSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-2 py-1">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex flex-col gap-1 rounded-xl bg-muted p-5">
        <div className="flex items-center justify-between py-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center justify-between py-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  )
}

export function SetSpendingBudget({
  title = 'Set spending budget',
  amount: initialAmount = 500,
  spentLast7Days = 0,
  cycles = DEFAULT_CYCLES,
  categories = DEFAULT_CATEGORIES,
  loading: forcedLoading,
  className,
}: SetSpendingBudgetProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [amount, setAmount] = React.useState(initialAmount)
  const [cycleIndex, setCycleIndex] = React.useState(0)
  const [categoriesOpen, setCategoriesOpen] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState(false)

  if (loading) return <SetSpendingBudgetSkeleton className={className} />

  const cycle = cycles[cycleIndex % cycles.length] ?? cycles[0]
  const allocated = categories.reduce((sum, c) => sum + c.amount, 0)

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value)
    setAmount(Number.isFinite(next) ? next : 0)
    setConfirmed(false)
  }

  function cycleForward() {
    setCycleIndex((i) => (i + 1) % cycles.length)
    setConfirmed(false)
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
          <Badge className={cn(confirmed ? 'bg-success/15 text-success' : 'bg-primary text-primary-foreground')}>
            {confirmed ? 'Active' : 'New'}
          </Badge>
        </div>
        <button
          type="button"
          onClick={refresh}
          aria-label="Refresh budget details"
          className="flex size-9 items-center justify-center rounded-full bg-accent/60 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <IconDots className="size-6" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 py-1">
        <div className="flex items-baseline justify-center">
          <span className="text-[40px] font-semibold leading-none tracking-tight">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={10}
            value={amount}
            onChange={handleAmountChange}
            aria-label="Spending budget amount"
            className="w-[140px] border-none bg-transparent text-center text-[40px] font-semibold leading-none tracking-tight tabular-nums text-foreground outline-none [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <p className="text-base font-medium text-muted-foreground">
          Last 7 days: {currencyFormatter.format(spentLast7Days)}
        </p>
      </div>

      <div className="flex w-full flex-col rounded-xl bg-muted">
        <button
          type="button"
          onClick={cycleForward}
          className="flex w-full items-center justify-between rounded-t-xl px-6 pb-3 pt-5 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <span className="text-sm font-medium text-muted-foreground">Cycle</span>
          <span className="flex items-center gap-2 text-sm font-medium text-primary">
            <IconCalendar className="size-5" />
            {cycle.label}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setCategoriesOpen((v) => !v)}
          aria-expanded={categoriesOpen}
          className={cn(
            'flex w-full items-center justify-between px-6 pb-5 pt-3 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            !categoriesOpen && 'rounded-b-xl',
          )}
        >
          <span className="text-sm font-medium text-muted-foreground">Budget categories</span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary">
            {categories.length} categories
            <IconChevronDown className={cn('size-4 transition-transform', categoriesOpen && 'rotate-180')} />
          </span>
        </button>
        {categoriesOpen && (
          <ul className="flex flex-col gap-2 rounded-b-xl px-6 pb-5">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{c.name}</span>
                <span className="font-medium text-muted-foreground">{currencyFormatter.format(c.amount)}</span>
              </li>
            ))}
            <li className="mt-1 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
              <span>Allocated</span>
              <span className={allocated > amount ? 'text-destructive' : 'text-foreground'}>
                {currencyFormatter.format(allocated)} / {currencyFormatter.format(amount)}
              </span>
            </li>
          </ul>
        )}
      </div>

      <Button
        size="lg"
        variant={confirmed ? 'success' : 'default'}
        disabled={confirmed}
        onClick={() => setConfirmed(true)}
        className="h-14 w-full rounded-xl text-lg font-bold"
      >
        {confirmed ? 'Budget confirmed' : 'Confirm'}
      </Button>
    </div>
  )
}

export default SetSpendingBudget

/**
 * Tailwind v4 theme variables this component relies on.
 * Copy into your project's global stylesheet (e.g. styles.css) alongside `@import 'tailwindcss';`.
 * Requires `@custom-variant dark (&:where(.dark, .dark *));` for the .dark overrides to apply.
 *
 * :root {
 *   --radius: 0.75rem;
 * 
 *   --background: oklch(0.99 0.002 260);
 *   --foreground: oklch(0.19 0.015 260);
 * 
 *   --card: oklch(1 0 0);
 *   --card-foreground: oklch(0.19 0.015 260);
 * 
 *   --popover: oklch(1 0 0);
 *   --popover-foreground: oklch(0.19 0.015 260);
 * 
 *   --primary: oklch(0.5 0.19 264);
 *   --primary-foreground: oklch(0.99 0.005 260);
 * 
 *   --secondary: oklch(0.955 0.008 260);
 *   --secondary-foreground: oklch(0.28 0.02 260);
 * 
 *   --muted: oklch(0.955 0.008 260);
 *   --muted-foreground: oklch(0.5 0.02 260);
 * 
 *   --accent: oklch(0.94 0.03 264);
 *   --accent-foreground: oklch(0.32 0.08 264);
 * 
 *   --destructive: oklch(0.58 0.22 25);
 *   --destructive-foreground: oklch(0.99 0.005 260);
 * 
 *   --success: oklch(0.6 0.135 155);
 *   --success-foreground: oklch(0.99 0.005 260);
 * 
 *   --warning: oklch(0.77 0.16 75);
 *   --warning-foreground: oklch(0.25 0.05 75);
 * 
 *   --border: oklch(0.9 0.008 260);
 *   --input: oklch(0.9 0.008 260);
 *   --ring: oklch(0.5 0.19 264 / 45%);
 * 
 *   --chart-1: oklch(0.5 0.19 264);
 *   --chart-2: oklch(0.6 0.135 155);
 *   --chart-3: oklch(0.77 0.16 75);
 *   --chart-4: oklch(0.62 0.2 320);
 *   --chart-5: oklch(0.65 0.19 25);
 * }
 *
 * .dark {
 *   --background: oklch(0.17 0.014 260);
 *   --foreground: oklch(0.95 0.006 260);
 * 
 *   --card: oklch(0.21 0.015 260);
 *   --card-foreground: oklch(0.95 0.006 260);
 * 
 *   --popover: oklch(0.21 0.015 260);
 *   --popover-foreground: oklch(0.95 0.006 260);
 * 
 *   --primary: oklch(0.68 0.16 264);
 *   --primary-foreground: oklch(0.15 0.02 264);
 * 
 *   --secondary: oklch(0.27 0.015 260);
 *   --secondary-foreground: oklch(0.92 0.006 260);
 * 
 *   --muted: oklch(0.27 0.015 260);
 *   --muted-foreground: oklch(0.68 0.015 260);
 * 
 *   --accent: oklch(0.3 0.05 264);
 *   --accent-foreground: oklch(0.88 0.03 264);
 * 
 *   --destructive: oklch(0.65 0.2 25);
 *   --destructive-foreground: oklch(0.15 0.02 25);
 * 
 *   --success: oklch(0.68 0.14 155);
 *   --success-foreground: oklch(0.15 0.03 155);
 * 
 *   --warning: oklch(0.78 0.15 75);
 *   --warning-foreground: oklch(0.2 0.04 75);
 * 
 *   --border: oklch(1 0 0 / 10%);
 *   --input: oklch(1 0 0 / 15%);
 *   --ring: oklch(0.68 0.16 264 / 45%);
 * 
 *   --chart-1: oklch(0.68 0.16 264);
 *   --chart-2: oklch(0.68 0.14 155);
 *   --chart-3: oklch(0.78 0.15 75);
 *   --chart-4: oklch(0.7 0.18 320);
 *   --chart-5: oklch(0.7 0.17 25);
 * }
 */
