'use client'

import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/project-demos/fintech-components/ui/tabs'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface AnalyticsCategory {
  id: string
  label: string
  emoji: string
  amount: number
  sub: string
  percent: number
}

export interface AnalyticsProps {
  className?: string
  loading?: boolean
  expenses?: AnalyticsCategory[]
  budgets?: AnalyticsCategory[]
  income?: AnalyticsCategory[]
}

const defaultExpenses: AnalyticsCategory[] = [
  { id: 'dining', label: 'Dining', emoji: '🍔', amount: -1240.55, sub: '620.00 balance', percent: 72 },
  { id: 'transport', label: 'Transport', emoji: '🚕', amount: -560.2, sub: '310.00 balance', percent: 45 },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', amount: -2890.0, sub: '1,110.00 balance', percent: 91 },
]

const defaultBudgets: AnalyticsCategory[] = [
  { id: 'groceries', label: 'Groceries', emoji: '🥬', amount: -4385.02, sub: '3,624.09 balance', percent: 69 },
  { id: 'gifts', label: 'Gifts', emoji: '🎁', amount: -2124.09, sub: '800.34 balance', percent: 84 },
  { id: 'health', label: 'Health', emoji: '💊', amount: -8122.5, sub: '6,400.50 balance', percent: 16 },
]

const defaultIncome: AnalyticsCategory[] = [
  { id: 'salary', label: 'Salary', emoji: '💼', amount: 6200.0, sub: 'Received', percent: 100 },
  { id: 'freelance', label: 'Freelance', emoji: '💻', amount: 1450.0, sub: 'Pending', percent: 58 },
  { id: 'dividends', label: 'Dividends', emoji: '📈', amount: 320.0, sub: 'Received', percent: 100 },
]

const tabMeta: Record<string, { metricLabel: string }> = {
  expenses: { metricLabel: 'spent' },
  budgets: { metricLabel: 'spent' },
  income: { metricLabel: 'received' },
}

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : '+'
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function RingIcon({ percent, emoji }: { percent: number; emoji: string }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)
  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r={radius} className="stroke-border" strokeWidth="4" fill="none" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="stroke-foreground transition-[stroke-dashoffset] duration-700 ease-out"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-3xl">{emoji}</div>
    </div>
  )
}

export function Analytics({
  className,
  loading: loadingProp,
  expenses = defaultExpenses,
  budgets = defaultBudgets,
  income = defaultIncome,
}: AnalyticsProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [tab, setTab] = React.useState('budgets')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const datasets: Record<string, AnalyticsCategory[]> = { expenses, budgets, income }
  const categories = datasets[tab] ?? []
  const selected = categories.find((c) => c.id === selectedId) ?? null
  const metricLabel = tabMeta[tab]?.metricLabel ?? 'spent'

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-6 p-6', className)}>
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="flex h-64 w-full items-center gap-3">
          <Skeleton className="h-full flex-1 rounded-xl" />
          <Skeleton className="h-full flex-1 rounded-xl" />
          <Skeleton className="h-full flex-1 rounded-xl" />
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-6 p-6', className)}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Analytics</p>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Refresh analytics"
            onClick={refresh}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v)
            setSelectedId(null)
          }}
          className="w-full"
        >
          <TabsList className="w-full justify-between gap-2 rounded-none border-b border-border bg-transparent p-0">
            {(['expenses', 'budgets', 'income'] as const).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className={cn(
                  'flex-1 rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 text-base font-medium capitalize text-muted-foreground shadow-none',
                  tab === key && 'border-primary bg-transparent text-foreground',
                )}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex w-full gap-3">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId((prev) => (prev === c.id ? null : c.id))}
            aria-pressed={selectedId === c.id}
            className={cn(
              'flex flex-1 flex-col items-center justify-end overflow-hidden rounded-xl bg-muted outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring',
              selectedId === c.id && 'ring-2 ring-primary',
            )}
          >
            <div className="flex w-full flex-1 flex-col items-center gap-4 py-5">
              <RingIcon percent={c.percent} emoji={c.emoji} />
              <div className="flex w-[115px] flex-col items-center gap-1 text-center">
                <p className="w-full text-sm font-medium text-foreground">{c.label}</p>
                <p className={cn('w-full text-sm font-semibold', c.amount < 0 ? 'text-destructive' : 'text-success')}>
                  {formatCurrency(c.amount)}
                </p>
                <p className="w-full text-xs font-medium text-muted-foreground">{c.sub}</p>
              </div>
            </div>
            <div className="flex w-full items-center justify-center bg-foreground py-1.5">
              <p className="text-xs font-medium text-background">
                {c.percent}% {metricLabel}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="flex w-full items-center justify-between rounded-xl bg-secondary p-4 text-sm">
          <span className="font-medium text-foreground">
            {selected.emoji} {selected.label}
          </span>
          <span className="text-muted-foreground">
            {selected.percent}% {metricLabel} &middot; {selected.sub}
          </span>
        </div>
      )}
    </Card>
  )
}

export default Analytics

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
