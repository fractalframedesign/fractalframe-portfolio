'use client'

import { ArrowLeftRight, FileText, Globe, RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/project-demos/fintech-components/ui/card'
import { Progress } from '@/components/project-demos/fintech-components/ui/progress'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/project-demos/fintech-components/ui/tabs'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface ExpenseRow {
  id: string
  label: string
  percent: number
  amount: number
  icon: 'transactions' | 'bills' | 'subscriptions'
}

export interface AverageExpensesProps {
  className?: string
  loading?: boolean
  title?: string
  rowsByPeriod?: Record<'Week' | 'Month' | 'Year', ExpenseRow[]>
}

const ICONS: Record<ExpenseRow['icon'], React.ComponentType<{ className?: string }>> = {
  transactions: ArrowLeftRight,
  bills: FileText,
  subscriptions: Globe,
}

const DEFAULT_ROWS: Record<'Week' | 'Month' | 'Year', ExpenseRow[]> = {
  Week: [
    { id: 'transactions', label: 'Transactions', percent: 62, amount: 2140, icon: 'transactions' },
    { id: 'bills', label: 'Payments & Bills', percent: 30, amount: 980, icon: 'bills' },
    { id: 'subscriptions', label: 'Subscriptions', percent: 8, amount: 265, icon: 'subscriptions' },
  ],
  Month: [
    { id: 'transactions', label: 'Transactions', percent: 84, amount: 11890, icon: 'transactions' },
    { id: 'bills', label: 'Payments & Bills', percent: 48, amount: 5420, icon: 'bills' },
    { id: 'subscriptions', label: 'Subscriptions', percent: 16, amount: 1599, icon: 'subscriptions' },
  ],
  Year: [
    { id: 'transactions', label: 'Transactions', percent: 91, amount: 128400, icon: 'transactions' },
    { id: 'bills', label: 'Payments & Bills', percent: 55, amount: 61920, icon: 'bills' },
    { id: 'subscriptions', label: 'Subscriptions', percent: 22, amount: 18760, icon: 'subscriptions' },
  ],
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

export function AverageExpenses({
  className,
  loading: loadingProp,
  title = 'Average expenses',
  rowsByPeriod = DEFAULT_ROWS,
}: AverageExpensesProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [period, setPeriod] = React.useState<'Week' | 'Month' | 'Year'>('Week')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const rows = rowsByPeriod[period]
  const selected = rows.find((r) => r.id === selectedId) ?? null

  return (
    <Card className={cn('max-w-[480px] p-6', className)}>
      <CardHeader className="gap-3 p-0">
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-wide text-muted-foreground">{title}</p>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Refresh average expenses"
            onClick={refresh}
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
            {(['Week', 'Month', 'Year'] as const).map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                className={cn(
                  'rounded-none border-b-2 border-transparent bg-transparent pb-2 pt-1 text-base font-medium shadow-none',
                  period === p ? 'border-foreground text-foreground' : 'text-muted-foreground',
                )}
              >
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0 pt-6">
        {loading ? (
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
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((row) => {
              const Icon = ICONS[row.icon]
              const isSelected = selectedId === row.id
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(isSelected ? null : row.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center gap-3 rounded-xl p-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected ? 'bg-accent' : 'hover:bg-secondary/60',
                  )}
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
                      </span>
                    </span>
                    <Progress value={row.percent} className="h-3.5" />
                  </span>
                </button>
              )
            })}
            {selected && (
              <p className="rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{selected.label}</span> made up{' '}
                {selected.percent}% of your {period.toLowerCase()}ly spend — {formatCurrency(selected.amount)} total.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AverageExpenses

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
