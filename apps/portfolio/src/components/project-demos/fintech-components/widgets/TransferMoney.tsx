'use client'

import { ArrowLeftRight, Check, ChevronDown, Copy, RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface TransferMoneyAccount {
  label: string
  maskedNumber: string
  amount: number
  currency: string
  available: number
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'] as const

// Fixed sample conversion table (relative to USD) so the "to" amount can
// recompute live without ever touching a network or the clock.
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  JPY: 154.2,
}

export interface TransferMoneyProps {
  className?: string
  loading?: boolean
  showHeader?: boolean
  title?: string
  from?: TransferMoneyAccount
  to?: TransferMoneyAccount
}

const defaultFrom: TransferMoneyAccount = {
  label: 'From card',
  maskedNumber: '54**81',
  amount: 200,
  currency: 'USD',
  available: 3200,
}

const defaultTo: TransferMoneyAccount = {
  label: 'To card',
  maskedNumber: '84**32',
  amount: 186,
  currency: 'EUR',
  available: 2800,
}

function formatAmount(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function AccountPanel({
  account,
  onCycleCurrency,
  onAmountChange,
  onCopy,
  copied,
  editable,
}: {
  account: TransferMoneyAccount
  onCycleCurrency: () => void
  onAmountChange?: (value: number) => void
  onCopy: () => void
  copied: boolean
  editable: boolean
}) {
  return (
    <div className="flex w-full flex-1 flex-col gap-4 rounded-xl bg-muted p-4">
      <div className="flex w-full items-center justify-between">
        <p className="text-sm text-muted-foreground">{account.label}</p>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Copy account number ${account.maskedNumber}`}
        >
          {account.maskedNumber}
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-1">
          <span className="shrink-0 font-medium text-2xl text-foreground">$</span>
          {editable ? (
            <input
              type="number"
              min={0}
              step="0.01"
              value={account.amount}
              onChange={(e) => onAmountChange?.(Number(e.target.value))}
              aria-label={`${account.label} amount`}
              className="w-full min-w-0 bg-transparent font-semibold text-3xl text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            />
          ) : (
            <span className="font-semibold text-3xl text-foreground tabular-nums">{formatAmount(account.amount)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onCycleCurrency}
          className="flex shrink-0 items-center gap-1 rounded-full bg-foreground px-3 py-2 text-sm font-semibold text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Change currency, currently ${account.currency}`}
        >
          {account.currency}
          <ChevronDown className="size-4" />
        </button>
      </div>
      <div className="flex w-full items-center justify-between">
        <p className="text-sm text-muted-foreground">Available</p>
        <p className="font-medium text-foreground">${account.available.toLocaleString('en-US')}</p>
      </div>
    </div>
  )
}

export function TransferMoney({
  className,
  loading: forcedLoading,
  showHeader = true,
  title = 'Transfer Money',
  from = defaultFrom,
  to = defaultTo,
}: TransferMoneyProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [fromAccount, setFromAccount] = React.useState(from)
  const [toAccount, setToAccount] = React.useState(to)
  const [copiedKey, setCopiedKey] = React.useState<'from' | 'to' | null>(null)

  const [prevFrom, setPrevFrom] = React.useState(from)
  const [prevTo, setPrevTo] = React.useState(to)

  // Re-sync when the props change (adjusting state during render, not in an effect)
  if (prevFrom !== from) {
    setPrevFrom(from)
    setFromAccount(from)
  }
  if (prevTo !== to) {
    setPrevTo(to)
    setToAccount(to)
  }

  const copyTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(copyTimeout.current), [])

  function handleCopy(which: 'from' | 'to') {
    const account = which === 'from' ? fromAccount : toAccount
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(account.maskedNumber).catch(() => {})
    }
    setCopiedKey(which)
    clearTimeout(copyTimeout.current)
    copyTimeout.current = setTimeout(() => setCopiedKey(null), 1500)
  }

  function cycleCurrency(which: 'from' | 'to') {
    const setter = which === 'from' ? setFromAccount : setToAccount
    setter((prev) => {
      const idx = CURRENCIES.indexOf(prev.currency as (typeof CURRENCIES)[number])
      const next = CURRENCIES[(idx + 1) % CURRENCIES.length]
      return { ...prev, currency: next }
    })
  }

  function updateFromAmount(value: number) {
    setFromAccount((prev) => ({ ...prev, amount: value }))
    setToAccount((prev) => {
      const converted = (value / RATES[fromAccount.currency]) * RATES[prev.currency]
      return { ...prev, amount: Math.round(converted * 100) / 100 }
    })
  }

  function swap() {
    setFromAccount(toAccount)
    setToAccount(fromAccount)
  }

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        )}
        <div className="flex w-full flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex w-full flex-col gap-4 rounded-xl bg-muted p-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-9 w-16 rounded-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      {showHeader && (
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-secondary"
            aria-label={`Refresh ${title}`}
            onClick={refresh}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      )}
      <div className="relative flex w-full flex-col gap-4">
        <AccountPanel
          account={fromAccount}
          onCycleCurrency={() => cycleCurrency('from')}
          onAmountChange={updateFromAmount}
          onCopy={() => handleCopy('from')}
          copied={copiedKey === 'from'}
          editable
        />
        <AccountPanel
          account={toAccount}
          onCycleCurrency={() => cycleCurrency('to')}
          onCopy={() => handleCopy('to')}
          copied={copiedKey === 'to'}
          editable={false}
        />
        <button
          type="button"
          onClick={swap}
          aria-label="Swap from and to accounts"
          className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 flex size-11 items-center justify-center rounded-full border-4 border-card bg-muted text-foreground outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <ArrowLeftRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default TransferMoney

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
