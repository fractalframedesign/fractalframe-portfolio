'use client'

import { ArrowLeftRight, ChevronDown, FileText, Globe, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Progress } from '@/components/project-demos/fintech-components/ui/progress'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export type Expenses2Period = 'Week' | 'Month' | 'Year'

export interface Expenses2Row {
  id: string
  label: string
  percent: number
  amount: number
  previousAmount: number
  icon: 'transactions' | 'bills' | 'subscriptions'
}

export interface Expenses2Props {
  className?: string
  loading?: boolean
  title?: string
  rowsByPeriod?: Record<Expenses2Period, Expenses2Row[]>
}

const ICONS: Record<Expenses2Row['icon'], React.ComponentType<{ className?: string }>> = {
  transactions: ArrowLeftRight,
  bills: FileText,
  subscriptions: Globe,
}

const DEFAULT_ROWS: Record<Expenses2Period, Expenses2Row[]> = {
  Week: [
    { id: 'transactions', label: 'Transactions', percent: 62, amount: 2140, previousAmount: 1890, icon: 'transactions' },
    { id: 'bills', label: 'Payments & Bills', percent: 30, amount: 980, previousAmount: 1040, icon: 'bills' },
    { id: 'subscriptions', label: 'Subscriptions', percent: 8, amount: 265, previousAmount: 265, icon: 'subscriptions' },
  ],
  Month: [
    { id: 'transactions', label: 'Transactions', percent: 84, amount: 11890, previousAmount: 10420, icon: 'transactions' },
    { id: 'bills', label: 'Payments & Bills', percent: 48, amount: 5420, previousAmount: 5900, icon: 'bills' },
    { id: 'subscriptions', label: 'Subscriptions', percent: 16, amount: 1599, previousAmount: 1450, icon: 'subscriptions' },
  ],
  Year: [
    { id: 'transactions', label: 'Transactions', percent: 91, amount: 128400, previousAmount: 118200, icon: 'transactions' },
    { id: 'bills', label: 'Payments & Bills', percent: 55, amount: 61920, previousAmount: 64100, icon: 'bills' },
    { id: 'subscriptions', label: 'Subscriptions', percent: 22, amount: 18760, previousAmount: 16980, icon: 'subscriptions' },
  ],
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function Expenses2Skeleton({ className }: { className?: string }) {
  return (
 <div className={cn('flex max-w-[480px] flex-col gap-8 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="flex w-full items-center gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-[58px] shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3.5 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Expenses2({
  className,
  loading: loadingProp,
  title = 'Expenses',
  rowsByPeriod = DEFAULT_ROWS,
}: Expenses2Props) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [period, setPeriod] = React.useState<Expenses2Period>('Week')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [highSpendOnly, setHighSpendOnly] = React.useState(false)

  if (loading) return <Expenses2Skeleton className={className} />

  const allRows = rowsByPeriod[period]
  const rows = highSpendOnly ? allRows.filter((r) => r.percent >= 50) : allRows

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-8 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Refresh expenses"
            onClick={refresh}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        <div className="flex w-full items-center gap-2" role="tablist" aria-label="Time period">
          {(['Week', 'Month', 'Year'] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                'flex-1 border-b-2 pb-2 pt-1 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                period === p ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter rows">
        <button
          type="button"
          aria-pressed={!highSpendOnly}
          onClick={() => setHighSpendOnly(false)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !highSpendOnly ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
          )}
        >
          All
        </button>
        <button
          type="button"
          aria-pressed={highSpendOnly}
          onClick={() => setHighSpendOnly(true)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            highSpendOnly ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
          )}
        >
          High spend (50%+)
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No categories match this filter.</p>
        ) : (
          rows.map((row) => {
            const Icon = ICONS[row.icon]
            const isExpanded = expandedId === row.id
            const delta = row.previousAmount === 0 ? 0 : ((row.amount - row.previousAmount) / row.previousAmount) * 100
            return (
              <div key={row.id} className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : row.id)}
                  aria-expanded={isExpanded}
                  className="flex items-center gap-3 rounded-xl p-2 text-left transition-colors outline-none hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-[58px] shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-6 text-foreground" />
                  </span>
                  <span className="flex flex-1 flex-col gap-3">
                    <span className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-foreground">{row.label}</span>
                      <span className="flex items-center gap-2 text-base text-muted-foreground">
                        {row.percent}%
                        <span className="size-1 rounded-full bg-muted-foreground" aria-hidden="true" />
                        {formatCurrency(row.amount)}
                        <ChevronDown className={cn('size-4 transition-transform', isExpanded && 'rotate-180')} />
                      </span>
                    </span>
                    <Progress value={row.percent} className="h-3.5" />
                  </span>
                </button>
                {isExpanded && (
                  <p className="ml-[70px] rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                    {delta === 0 ? (
                      <>Unchanged vs previous {period.toLowerCase()}.</>
                    ) : (
                      <>
                        <span className={cn('font-semibold', delta > 0 ? 'text-destructive' : 'text-success')}>
                          {delta > 0 ? '+' : ''}
                          {delta.toFixed(1)}%
                        </span>{' '}
                        vs previous {period.toLowerCase()} ({formatCurrency(row.previousAmount)}).
                      </>
                    )}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Expenses2

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
