'use client'

import { ChevronDown, MoreHorizontal, Wifi } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface PaymentProps {
  className?: string
  loading?: boolean
  title?: string
  cardLabel?: string
  maskedNumber?: string
  balance?: number
  currency?: string
}

const CURRENCIES = ['USD', 'EUR', 'GBP'] as const
type Currency = (typeof CURRENCIES)[number]

function PaymentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        <Skeleton className="size-9 rounded-full" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

const balanceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function Payment({
  className,
  loading: loadingProp,
  title = 'Payment',
  cardLabel = 'USD Balance',
  maskedNumber = '3954',
  balance = 3444.6,
  currency: currencyProp = 'USD',
}: PaymentProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [amount, setAmount] = React.useState('3200,00')
  const [currency, setCurrency] = React.useState<Currency>(currencyProp as Currency)

  if (loading) return <PaymentSkeleton className={className} />

  const amountNum = parseFloat(amount.replace(/,/g, '.')) || 0
  const canPay = amountNum > 0 && amountNum <= balance

  function cycleCurrency() {
    setCurrency((c) => {
      const idx = CURRENCIES.indexOf(c)
      return CURRENCIES[(idx + 1) % CURRENCIES.length]
    })
  }

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            New
          </span>
        </div>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh payment"
          onClick={refresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      {/* Card visual */}
      <div className="relative h-36 w-full overflow-hidden rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, oklch(0.45 0.22 280) 0%, oklch(0.3 0.18 270) 50%, oklch(0.2 0.08 260) 100%)' }}
      >
        <Wifi className="absolute left-5 top-5 size-6 -rotate-90 text-white/60" aria-hidden="true" />
        <span className="absolute right-5 top-5 font-bold italic tracking-widest text-white text-lg">VISA</span>
      </div>

      {/* Balance row */}
      <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
          $
        </div>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium">{cardLabel}</span>
          <span className="font-mono text-xs text-muted-foreground">•••• {maskedNumber}</span>
        </div>
        <span className="tabular-nums text-sm font-semibold">
          ${balanceFormatter.format(balance)}
        </span>
      </div>

      {/* Currency selector + All Transactions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={cycleCurrency}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
          aria-label={`Currency: ${currency}`}
        >
          {currency}
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="text-sm font-medium text-primary transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          All Transactions
        </button>
      </div>

      {/* Amount input */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">$</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[32px] font-bold tabular-nums leading-tight outline-none placeholder:text-muted-foreground"
            placeholder="0,00"
            aria-label="Payment amount"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Balance: ${balanceFormatter.format(balance)}
        </p>
      </div>

      <Button
        size="lg"
        className="h-12 w-full rounded-xl text-base font-semibold active:scale-[0.96]"
        disabled={!canPay}
        onClick={refresh}
      >
        Pay Now
      </Button>
    </div>
  )
}

export default Payment

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
 *   --primary: oklch(0.5 0.19 264);
 *   --primary-foreground: oklch(0.99 0.005 260);
 *
 *   --secondary: oklch(0.955 0.008 260);
 *   --secondary-foreground: oklch(0.28 0.02 260);
 *
 *   --muted: oklch(0.955 0.008 260);
 *   --muted-foreground: oklch(0.5 0.02 260);
 *
 *   --border: oklch(0.9 0.008 260);
 *   --ring: oklch(0.5 0.19 264 / 45%);
 * }
 *
 * .dark {
 *   --background: oklch(0.17 0.014 260);
 *   --foreground: oklch(0.95 0.006 260);
 *
 *   --card: oklch(0.21 0.015 260);
 *   --card-foreground: oklch(0.95 0.006 260);
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
 *   --border: oklch(1 0 0 / 10%);
 *   --ring: oklch(0.68 0.16 264 / 45%);
 * }
 */
