'use client'

import { Check, ChevronDown, Pencil } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Separator } from '@/components/project-demos/fintech-components/ui/separator'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const CURRENCIES = ['UAN', 'USD', 'EUR', 'GBP'] as const
const PERIODS = ['Week', 'Month', 'Year'] as const

export interface MoneyEnvelopeProps {
  /** Emoji shown inside the envelope icon */
  icon?: string
  /** Envelope name / label above the title */
  label?: string
  /** Title of the envelope */
  name?: string
  /** Budget amount, formatted */
  budget?: string
  /** Force the loading/skeleton state (story control override) */
  loading?: boolean
  className?: string
}

export function MoneyEnvelope({
  icon = '🎁',
  label = 'Envelope Name',
  name = 'Birthday Budget',
  budget = '$400.00',
  loading: forcedLoading,
  className,
}: MoneyEnvelopeProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [currencyIndex, setCurrencyIndex] = React.useState(0)
  const [periodIndex, setPeriodIndex] = React.useState(1)
  const [saved, setSaved] = React.useState(false)

  const currency = CURRENCIES[currencyIndex]
  const period = PERIODS[periodIndex]

  const cycleCurrency = () => setCurrencyIndex((i) => (i + 1) % CURRENCIES.length)
  const cyclePeriod = () => setPeriodIndex((i) => (i + 1) % PERIODS.length)

  const handleConfirm = () => {
    setSaved(true)
    refresh()
    window.setTimeout(() => setSaved(false), 1500)
  }

  if (loading) {
    return (
      <div
        className={cn(
 'flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6',
          className,
        )}
      >
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="flex w-full flex-col items-center gap-6 py-2">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-44" />
          </div>
        </div>
        <div className="flex w-full gap-2">
          <Skeleton className="h-24 flex-1 rounded-xl" />
          <Skeleton className="h-24 flex-1 rounded-xl" />
          <Skeleton className="h-24 flex-1 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-base uppercase tracking-wide text-muted-foreground">
          Money Envelope
        </p>
        <Button
          type="button"
          size="icon"
          variant="default"
          className="rounded-full"
          aria-label={saved ? 'Saved' : 'Confirm envelope details'}
          onClick={handleConfirm}
        >
          <Check className={cn('size-5 transition-transform', saved && 'scale-110')} />
        </Button>
      </div>

      <div className="flex w-full flex-col items-center gap-8 py-2">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-end justify-center">
            <div className="-mr-4 flex size-20 items-center justify-center rounded-full bg-accent text-4xl">
              <span aria-hidden="true">{icon}</span>
            </div>
            <button
              type="button"
              aria-label="Edit envelope icon"
              className="flex size-[30px] items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80"
              onClick={refresh}
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-base font-medium tracking-wide text-muted-foreground">{label}</p>
            <div className="flex flex-col items-center gap-3">
              <p className="text-center text-[32px] font-bold leading-tight tracking-tight text-foreground">
                {name}
              </p>
              <Separator className="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-stretch gap-2">
        <div className="flex flex-1 flex-col justify-center gap-3 rounded-xl bg-muted p-4">
          <p className="text-sm font-medium text-muted-foreground">Budget</p>
          <p className="text-xl font-semibold text-foreground">{budget}</p>
        </div>
        <button
          type="button"
          onClick={cycleCurrency}
          className="flex h-24 flex-1 flex-col justify-center gap-3 rounded-xl bg-muted p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Currency: ${currency}. Click to change.`}
        >
          <span className="text-sm font-medium text-muted-foreground">Currency</span>
          <span className="flex w-full items-center justify-between">
            <span className="text-xl font-semibold text-foreground">{currency}</span>
            <ChevronDown className="size-5 text-muted-foreground" />
          </span>
        </button>
        <button
          type="button"
          onClick={cyclePeriod}
          className="flex h-24 flex-1 flex-col justify-center gap-3 rounded-xl bg-muted p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Expiry period: ${period}. Click to change.`}
        >
          <span className="text-sm font-medium text-muted-foreground">Expiry Date</span>
          <span className="flex w-full items-center justify-between">
            <span className="text-xl font-semibold text-foreground">{period}</span>
            <ChevronDown className="size-5 text-muted-foreground" />
          </span>
        </button>
      </div>
    </div>
  )
}

export default MoneyEnvelope

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
