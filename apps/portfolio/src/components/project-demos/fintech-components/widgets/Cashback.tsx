'use client'

import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface CashbackSource {
  key: string
  name: string
  amount: string
  percent: number
  tone: 'primary' | 'teal'
}

export interface CashbackProps {
  ratePercent?: number
  totalAmount?: string
  sources?: CashbackSource[]
  /** Force the loading/skeleton state (story control override) */
  loading?: boolean
  className?: string
}

const DEFAULT_SOURCES: CashbackSource[] = [
  { key: 'internship', name: 'Internship & Contract', amount: '$110,12.00', percent: 34, tone: 'primary' },
  { key: 'freelance', name: 'Freelance Projects', amount: '$85,40.00', percent: 16, tone: 'primary' },
  { key: 'referrals', name: 'Referral Bonuses', amount: '$44,72.00', percent: 12, tone: 'teal' },
]

const BAR_COUNT = 48

export function Cashback({
  ratePercent = 12,
  totalAmount = '$ 240,24.00',
  sources = DEFAULT_SOURCES,
  loading: forcedLoading,
  className,
}: CashbackProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null)

  const filledBars = Math.round((BAR_COUNT * (sources[0]?.percent ?? 34)) / 100)
  const tealBars = Math.min(4, filledBars)

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-[46px] w-full rounded-md" />
        <Skeleton className="h-8 w-56" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-base uppercase tracking-wide text-muted-foreground">
            Cashback
          </p>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="rounded-full"
            aria-label="Refresh cashback"
            onClick={refresh}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Monthly cashback on spent money ({ratePercent}%).
        </p>
      </div>

      <div className="flex h-[46px] w-full items-center justify-between gap-1" role="img" aria-label={`Cashback progress, ${sources[0]?.percent ?? 0}% of monthly goal`}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-full w-[5px] rounded-full transition-colors',
              i < tealBars
                ? 'bg-success'
                : i < filledBars
                  ? 'bg-primary'
                  : 'bg-primary/15',
            )}
          />
        ))}
      </div>

      <div className="flex items-end gap-2">
        <p className="text-2xl font-semibold tracking-wide text-foreground">{totalAmount}</p>
        <p className="pb-0.5 text-sm font-medium text-muted-foreground">Total cashback this month</p>
      </div>

      <div className="flex flex-col gap-2">
        {sources.map((s) => {
          const isExpanded = expandedKey === s.key
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setExpandedKey(isExpanded ? null : s.key)}
              aria-expanded={isExpanded}
              className="flex w-full flex-col gap-1 rounded-lg bg-muted p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      s.tone === 'teal' ? 'bg-success' : 'bg-primary',
                    )}
                  />
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-foreground">{s.amount}</span>
                  <span
                    className={cn(
                      'rounded-md border px-2 py-0.5 text-xs font-medium',
                      s.tone === 'teal'
                        ? 'border-success/60 bg-success/10 text-success'
                        : 'border-primary bg-primary/5 text-primary',
                    )}
                  >
                    {s.percent}%
                  </span>
                </div>
              </div>
              {isExpanded && (
                <p className="pt-1 text-xs text-muted-foreground">
                  Contributed {s.percent}% of this month&apos;s total cashback, earned from {s.name.toLowerCase()}.
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Cashback

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
