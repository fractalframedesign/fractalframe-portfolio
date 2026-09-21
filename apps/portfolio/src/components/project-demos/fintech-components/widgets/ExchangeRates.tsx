'use client'

import { ArrowLeftRight, ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface ExchangeRate {
  currency: string
  flag: string
  buying: number
  selling: number
}

export interface ExchangeRatesProps {
  className?: string
  loading?: boolean
  title?: string
  rates?: ExchangeRate[]
  updatedAt?: string
}

const DEFAULT_RATES: ExchangeRate[] = [
  { currency: 'USD', flag: '🇺🇸', buying: 40900, selling: 41290 },
  { currency: 'EUR', flag: '🇪🇺', buying: 44210, selling: 44960 },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'] as const
type Currency = (typeof CURRENCIES)[number]

const CONVERT_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.3,
}

function ExchangeRatesSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-muted p-4">
        <div className="flex justify-between border-b border-border pb-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-10">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="flex justify-between py-2">
            <Skeleton className="h-5 w-20" />
            <div className="flex gap-10">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        ))}
        <div className="flex justify-between pt-1">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-[140px] rounded-xl" />
    </div>
  )
}

export function ExchangeRates({
  className,
  loading: loadingProp,
  title = 'Exchange Rates',
  rates = DEFAULT_RATES,
  updatedAt = '31.07.2024, 19:40',
}: ExchangeRatesProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [fromAmount, setFromAmount] = React.useState('2140.00')
  const [fromCurrency, setFromCurrency] = React.useState<Currency>('EUR')
  const [toCurrency, setToCurrency] = React.useState<Currency>('USD')

  if (loading) return <ExchangeRatesSkeleton className={className} />

  const fromVal = parseFloat(fromAmount.replace(/,/g, '')) || 0
  const toVal = (fromVal / CONVERT_RATES[fromCurrency]) * CONVERT_RATES[toCurrency]
  const toDisplay = toVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  function cycleCurrency(current: Currency, exclude: Currency): Currency {
    const options = CURRENCIES.filter((c) => c !== exclude)
    const idx = options.indexOf(current)
    return options[(idx + 1) % options.length]
  }

  function swapCurrencies() {
    const nextFrom = toCurrency
    const nextTo = fromCurrency
    setFromCurrency(nextFrom)
    setToCurrency(nextTo)
    setFromAmount(toDisplay.replace(/,/g, ''))
  }

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh rates"
          onClick={refresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="rounded-xl bg-muted/60 px-4 pb-3 pt-2">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <span className="text-xs text-muted-foreground">Currency</span>
          <div className="flex gap-12 pr-1">
            <span className="text-xs text-muted-foreground">Buying</span>
            <span className="text-xs text-muted-foreground">Selling</span>
          </div>
        </div>
        {rates.map((rate, idx) => (
          <React.Fragment key={rate.currency}>
            {idx > 0 && <div className="border-t border-border" />}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none" aria-hidden="true">{rate.flag}</span>
                <span className="font-medium">{rate.currency}</span>
              </div>
              <div className="flex gap-8 tabular-nums">
                <span className="w-16 text-right font-medium">{rate.buying.toLocaleString('en-US')}</span>
                <span className="w-16 text-right font-medium">{rate.selling.toLocaleString('en-US')}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-2.5">
          <span className="text-xs text-muted-foreground">Updated on {updatedAt}</span>
          <button
            type="button"
            className="text-xs font-medium text-primary transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            More Rates
          </button>
        </div>
      </div>

      <p className="text-base font-semibold">Convert currency</p>

      <div className="relative flex flex-col rounded-xl bg-muted/60 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xl font-medium tabular-nums outline-none placeholder:text-muted-foreground"
            placeholder="0.00"
            aria-label={`Amount in ${fromCurrency}`}
          />
          <button
            type="button"
            onClick={() => setFromCurrency((c) => cycleCurrency(c, toCurrency))}
            className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`From currency: ${fromCurrency}`}
          >
            {fromCurrency}
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        <div className="flex justify-center py-3">
          <button
            type="button"
            onClick={swapCurrencies}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
            aria-label="Swap currencies"
          >
            <ArrowLeftRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="min-w-0 flex-1 text-xl font-medium tabular-nums text-muted-foreground">
            {toDisplay}
          </span>
          <button
            type="button"
            onClick={() => setToCurrency((c) => cycleCurrency(c, fromCurrency))}
            className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`To currency: ${toCurrency}`}
          >
            {toCurrency}
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExchangeRates

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
