'use client'

import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const flagUs = '/images/projects/fintech-components/my-card/flag-us.svg'

function IconDots({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
      <circle cx="6" cy="12" r="1.25" fill="currentColor" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" />
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

function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTransfer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M16.5 16H4L7.98571 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 7L19 7L15.0143 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 7L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconConvert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M19 11C19 8.2 16.8 6 14 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 3L8 6L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 13C5 15.8 7.2 18 10 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 21L16 18L13 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 12C3 7 7 3 12 3C17 3 21 7 21 12C21 17 17 21 12 21C7 21 3 17 3 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export type MyCardTransaction = {
  id: string
  label: string
  detail: string
  amount: number
  timestamp: string
  kind: 'add' | 'transfer' | 'convert'
}

export type MyCardAccount = {
  id: string
  name: string
  balance: number
  currencyLabel: string
  currencyCode: string
}

export interface MyCardProps {
  title?: string
  accounts?: MyCardAccount[]
  transactions?: MyCardTransaction[]
  loading?: boolean
  className?: string
}

const DEFAULT_ACCOUNTS: MyCardAccount[] = [
  { id: 'checking', name: 'Checking', balance: 450, currencyLabel: 'United States Dollar', currencyCode: 'USD' },
  { id: 'savings', name: 'Savings', balance: 1284.32, currencyLabel: 'United States Dollar', currencyCode: 'USD' },
]

const DEFAULT_TRANSACTIONS: MyCardTransaction[] = [
  { id: 't1', label: 'Salary deposit', detail: 'Acme Corp', amount: 2400, timestamp: 'Today, 9:41 AM', kind: 'add' },
  { id: 't2', label: 'Transfer to Alex', detail: 'Personal', amount: -120, timestamp: 'Yesterday, 4:12 PM', kind: 'transfer' },
  { id: 't3', label: 'Converted to EUR', detail: '1 USD = 0.92 EUR', amount: -75, timestamp: 'Mon, 11:05 AM', kind: 'convert' },
  { id: 't4', label: 'Amazon purchase', detail: 'Shopping', amount: -54.2, timestamp: 'Sun, 6:30 PM', kind: 'transfer' },
  { id: 't5', label: 'Refund from Nike', detail: 'Returns', amount: 32.5, timestamp: 'Sat, 2:15 PM', kind: 'add' },
]

const ACTION_PRESETS = {
  add: { label: 'Money added', detail: 'Instant top-up', amount: 50 },
  transfer: { label: 'Transfer sent', detail: 'To saved payee', amount: -75 },
  convert: { label: 'Converted to EUR', detail: '1 USD = 0.92 EUR', amount: -20 },
} as const

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatAmount(amount: number) {
  const formatted = currencyFormatter.format(Math.abs(amount))
  return amount < 0 ? `-${formatted}` : `+${formatted}`
}

function iconForKind(kind: MyCardTransaction['kind']) {
  if (kind === 'add') return IconPlus
  if (kind === 'transfer') return IconTransfer
  return IconConvert
}

function MyCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <Skeleton className="size-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex w-full gap-4">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
      </div>
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}

export function MyCard({
  title = 'My Card',
  accounts = DEFAULT_ACCOUNTS,
  transactions = DEFAULT_TRANSACTIONS,
  loading: forcedLoading,
  className,
}: MyCardProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [accountIndex, setAccountIndex] = React.useState(0)
  const [items, setItems] = React.useState(transactions)
  const [showAll, setShowAll] = React.useState(false)
  const counterRef = React.useRef(0)

  if (loading) return <MyCardSkeleton className={className} />

  const account = accounts[accountIndex % accounts.length] ?? accounts[0]
  const visible = showAll ? items : items.slice(0, 3)

  function cycleAccount() {
    setAccountIndex((i) => (i + 1) % accounts.length)
  }

  function addTransaction(kind: keyof typeof ACTION_PRESETS) {
    const preset = ACTION_PRESETS[kind]
    counterRef.current += 1
    const next: MyCardTransaction = {
      id: `local-${kind}-${counterRef.current}`,
      timestamp: 'Just now',
      kind,
      ...preset,
    }
    setItems((prev) => [next, ...prev])
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <button
          type="button"
          onClick={refresh}
          aria-label="Refresh card details"
          className="flex size-9 items-center justify-center rounded-full bg-accent/60 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <IconDots className="size-6" />
        </button>
      </div>

      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-[32px] font-bold leading-none tracking-tight">
              {currencyFormatter.format(account.balance).replace('.00', '')}
            </p>
            <button
              type="button"
              onClick={cycleAccount}
              aria-label={`Switch account, currently ${account.name}`}
              className="flex size-9 items-center justify-center rounded-full bg-accent/60 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <IconChevronDown className="size-6" />
            </button>
          </div>
          <img src={flagUs} alt="" className="size-12 shrink-0 rounded-full" />
        </div>
        <p className="text-base font-medium">
          {account.name} &middot; {account.currencyLabel}
        </p>
      </div>

      <div className="flex w-full gap-4">
        <Button
          variant="secondary"
          className="h-11 flex-1 justify-center gap-2 rounded-xl bg-accent/60 hover:bg-accent"
          onClick={() => addTransaction('add')}
        >
          <IconPlus className="size-5" />
          Add money
        </Button>
        <Button
          variant="secondary"
          className="h-11 flex-1 justify-center gap-2 rounded-xl bg-accent/60 hover:bg-accent"
          onClick={() => addTransaction('transfer')}
        >
          <IconTransfer className="size-5" />
          Transfer
        </Button>
        <Button
          variant="secondary"
          className="h-11 flex-1 justify-center gap-2 rounded-xl bg-accent/60 hover:bg-accent"
          onClick={() => addTransaction('convert')}
        >
          <IconConvert className="size-5" />
          Convert
        </Button>
      </div>

      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between text-base font-medium">
          <p className="text-muted-foreground">Transactions</p>
          {items.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="text-muted-foreground/60 underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            >
              {showAll ? 'Show less' : 'See All'}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <IconClock className="size-6 text-muted-foreground/60" />
            </div>
            <p className="text-lg font-medium text-muted-foreground/60">No transactions yet</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((tx) => {
              const Icon = iconForKind(tx.kind)
              return (
                <li key={tx.id} className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium">{tx.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {tx.detail} &middot; {tx.timestamp}
                    </p>
                  </div>
                  <p className={cn('shrink-0 text-sm font-semibold', tx.amount < 0 ? 'text-destructive' : 'text-success')}>
                    {formatAmount(tx.amount)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MyCard

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
