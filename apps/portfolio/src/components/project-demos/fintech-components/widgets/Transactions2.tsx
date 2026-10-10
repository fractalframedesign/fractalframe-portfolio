'use client'

import { ArrowUp, Check, ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import { Badge } from '@/components/project-demos/fintech-components/ui/badge'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface TransactionsChartPoint {
  label: string
  value: number
}

export interface Transactions2Props {
  loading?: boolean
  className?: string
  showHeader?: boolean
  title?: string
  totalLabel?: string
  totalAmount?: number
  changePercent?: number
  expensesAmount?: number
  expensesChange?: number
  expensesData?: TransactionsChartPoint[]
  incomeAmount?: number
  incomeChange?: number
  incomeData?: TransactionsChartPoint[]
}

const DEFAULT_EXPENSES: TransactionsChartPoint[] = [
  { label: 'Mon', value: 32 },
  { label: 'Tue', value: 26 },
  { label: 'Wed', value: 60 },
  { label: 'Thu', value: 18 },
  { label: 'Fri', value: 26 },
  { label: 'Sat', value: 48 },
  { label: 'Sun', value: 18 },
]

const DEFAULT_INCOME: TransactionsChartPoint[] = [
  { label: 'Mon', value: 32 },
  { label: 'Tue', value: 48 },
  { label: 'Wed', value: 60 },
  { label: 'Thu', value: 7 },
  { label: 'Fri', value: 26 },
  { label: 'Sat', value: 18 },
  { label: 'Sun', value: 60 },
]

const RANGE_LABELS = ['This week', 'This month', 'This year']

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

function MiniChart({
  data,
  color,
  activeIndex,
  onSelect,
}: {
  data: TransactionsChartPoint[]
  color: string
  activeIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="h-[104px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          onClick={(state) => {
            if (state && typeof state.activeTooltipIndex === 'number') onSelect(state.activeTooltipIndex)
          }}
        >
          <XAxis dataKey="label" hide />
          <Tooltip
            cursor={{ fill: 'var(--color-muted)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const point = payload[0].payload as TransactionsChartPoint
              return (
                <div className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background shadow-md">
                  {point.label}: ${point.value}
                </div>
              )
            }}
          />
          <Bar dataKey="value" radius={[10, 10, 10, 10]} maxBarSize={22} className="cursor-pointer">
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={index === activeIndex ? color : 'var(--color-muted)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Transactions2({
  loading: loadingProp,
  className,
  showHeader = true,
  title = 'Transactions',
  totalLabel = 'Total transactions value',
  totalAmount = 14300,
  changePercent = 2.03,
  expensesAmount = 1254.95,
  expensesChange = 4.8,
  expensesData = DEFAULT_EXPENSES,
  incomeAmount = 4578.0,
  incomeChange = 3.2,
  incomeData = DEFAULT_INCOME,
}: Transactions2Props) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [rangeIndex, setRangeIndex] = React.useState(0)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [expensesActive, setExpensesActive] = React.useState(2)
  const [incomeActive, setIncomeActive] = React.useState(2)

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-5 p-6', className)}>
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex w-full gap-3">
          <Skeleton className="h-[232px] flex-1 rounded-xl" />
          <Skeleton className="h-[232px] flex-1 rounded-xl" />
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-5 p-6', className)}>
      {showHeader && (
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-normal uppercase tracking-[0.03em] text-muted-foreground">
            {title}
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="relative shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full"
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {RANGE_LABELS[rangeIndex]}
                <ChevronDown className={cn('size-4 transition-transform', menuOpen && 'rotate-180')} />
              </Button>
              {menuOpen && (
                <div
                  role="listbox"
                  aria-label="Select date range"
                  className="absolute right-0 top-full z-10 mt-1.5 w-36 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md"
                >
                  {RANGE_LABELS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      role="option"
                      aria-selected={index === rangeIndex}
                      onClick={() => {
                        setRangeIndex(index)
                        setMenuOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                        index === rangeIndex ? 'text-primary' : 'text-popover-foreground',
                      )}
                    >
                      {label}
                      {index === rangeIndex && <Check className="size-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="rounded-full"
              aria-label={`Refresh ${title}`}
              onClick={refresh}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-[32px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground tabular-nums">
              {currency(totalAmount)}
            </p>
            <p className="text-sm font-medium text-muted-foreground">{totalLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-1">
            <ArrowUp className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">{changePercent}%</span>
          </div>
        </div>
      </div>
      )}

      <div className="flex w-full items-stretch gap-3">
        <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border p-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-muted-foreground">Expenses</p>
              <p className="text-xl font-semibold text-foreground tabular-nums">{currency(expensesAmount)}</p>
            </div>
            <Badge className="bg-primary/10 text-primary">+{expensesChange}%</Badge>
          </div>
          <MiniChart
            data={expensesData}
            color="var(--color-primary)"
            activeIndex={expensesActive}
            onSelect={setExpensesActive}
          />
          <p className="text-center text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{expensesData[expensesActive]?.label}</span> &bull; $
            {expensesData[expensesActive]?.value}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border p-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-muted-foreground">Incomes</p>
              <p className="text-xl font-semibold text-foreground tabular-nums">{currency(incomeAmount)}</p>
            </div>
            <Badge className="bg-accent text-accent-foreground">+{incomeChange}%</Badge>
          </div>
          <MiniChart
            data={incomeData}
            color="var(--color-chart-2)"
            activeIndex={incomeActive}
            onSelect={setIncomeActive}
          />
          <p className="text-center text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{incomeData[incomeActive]?.label}</span> &bull; $
            {incomeData[incomeActive]?.value}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default Transactions2

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
