'use client'

import { RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface ExpenseCategory {
  id: string
  label: string
  /** Monthly amount in dollars, used as the baseline (Month period) value. */
  amount: number
  /** Semantic chart token, e.g. "chart-1". */
  color: string
}

export interface ExpensesBreakdownProps {
  className?: string
  loading?: boolean
  /** Card title shown as the uppercase eyebrow. */
  title?: string
  categories?: ExpenseCategory[]
}

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: 'shopping', label: 'Shopping', amount: 1500, color: 'chart-1' },
  { id: 'entertainment', label: 'Entertainment', amount: 1100, color: 'chart-2' },
  { id: 'transactions', label: 'Transactions', amount: 654, color: 'chart-3' },
]

const PERIODS = ['Week', 'Month', 'Year'] as const
type Period = (typeof PERIODS)[number]

const PERIOD_MULTIPLIER: Record<Period, number> = {
  Week: 0.25,
  Month: 1,
  Year: 12,
}

const RADIUS = 84
const STROKE = 20
const CENTER = 100
const GAP_DEG = 4

function arcPoint(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    // Rounded so server and client render identical SVG paths (avoids hydration mismatches)
    x: Math.round((CENTER + RADIUS * Math.cos(rad)) * 1000) / 1000,
    y: Math.round((CENTER - RADIUS * Math.sin(rad)) * 1000) / 1000,
  }
}

function describeArc(startAngle: number, endAngle: number) {
  const start = arcPoint(startAngle)
  const end = arcPoint(endAngle)
  const largeArcFlag = startAngle - endAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

export function ExpensesBreakdown({
  className,
  loading: loadingProp,
  title = 'Expenses',
  categories = DEFAULT_CATEGORIES,
}: ExpensesBreakdownProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [period, setPeriod] = React.useState<Period>('Month')
  const [activeIds, setActiveIds] = React.useState<string[]>(categories.map((c) => c.id))

  const scaled = React.useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        value: c.amount * PERIOD_MULTIPLIER[period],
      })),
    [categories, period],
  )

  const visible = scaled.filter((c) => activeIds.includes(c.id))
  const total = visible.reduce((sum, c) => sum + c.value, 0)
  const grandTotal = scaled.reduce((sum, c) => sum + c.value, 0) || 1

  function toggleCategory(id: string) {
    setActiveIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev
        return prev.filter((x) => x !== id)
      }
      return [...prev, id]
    })
  }

  // Build cumulative arc segments across the full 180deg sweep, sized by
  // each category's share of the (unfiltered) grand total so the gauge
  // proportions stay stable as categories are toggled on/off.
  let cursor = 180
  const segments: Array<{ id: string; color: string; isActive: boolean; path: string }> = []
  for (const c of scaled) {
    const share = c.value / grandTotal
    const span = share * 180
    const start = cursor - GAP_DEG / 2
    const end = cursor - span + GAP_DEG / 2
    cursor -= span
    segments.push({
      id: c.id,
      color: c.color,
      isActive: activeIds.includes(c.id),
      path: describeArc(start, end),
    })
  }

  return (
    <Card className={cn('max-w-[480px] p-6', className)}>
      <CardHeader className="flex-row items-center justify-between p-0">
        <p className="font-mono text-sm uppercase tracking-wide text-muted-foreground">{title}</p>
        <div className="flex items-center gap-1.5">
          <div className="inline-flex items-center gap-0.5 rounded-full bg-secondary p-1" role="tablist" aria-label="Time period">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Refresh expenses"
            onClick={refresh}
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-8">
        {loading ? (
          <div className="flex flex-col items-center gap-8">
            <Skeleton className="h-[130px] w-[260px] rounded-t-full" />
            <div className="flex w-full items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="relative mx-auto h-[130px] w-[200px]">
              <svg viewBox="0 0 200 110" className="absolute inset-x-0 top-0 w-full overflow-visible">
                <path
                  d={describeArc(180, 0)}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  className="stroke-muted"
                />
                {segments.map((seg) => (
                  <path
                    key={seg.id}
                    d={seg.path}
                    fill="none"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    style={{ stroke: `var(--color-${seg.color})` }}
                    className={cn('transition-opacity duration-200', !seg.isActive && 'opacity-20')}
                  />
                ))}
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-medium text-muted-foreground">Spending this {period.toLowerCase()}</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{formatCurrency(total)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {scaled.map((c) => {
                const isActive = activeIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-1 py-1 text-sm transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive ? 'text-muted-foreground' : 'opacity-40',
                    )}
                  >
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--color-${c.color})` }}
                      aria-hidden="true"
                    />
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ExpensesBreakdown

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
