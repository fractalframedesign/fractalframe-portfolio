'use client'

import { ArrowUp, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface ActivityDataPoint {
  label: string
  value: number
}

export interface ActivityProps {
  loading?: boolean
  className?: string
  title?: string
  totalLabel?: string
  totalAmount?: number
  changePercent?: number
  weekData?: ActivityDataPoint[]
  monthData?: ActivityDataPoint[]
}

const DEFAULT_WEEK: ActivityDataPoint[] = [
  { label: 'Mon', value: 180 },
  { label: 'Tue', value: 230 },
  { label: 'Wed', value: 260 },
  { label: 'Thu', value: 300 },
  { label: 'Fri', value: 360 },
]

const DEFAULT_MONTH: ActivityDataPoint[] = [
  { label: 'W1', value: 620 },
  { label: 'W2', value: 540 },
  { label: 'W3', value: 710 },
  { label: 'W4', value: 890 },
]

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ActivityDataPoint }> }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background shadow-md">
      {point.label}: {currency(point.value)}
    </div>
  )
}

export function Activity({
  loading: loadingProp,
  className,
  title = 'Activity',
  totalLabel = 'Total amount saved',
  totalAmount = 14300,
  changePercent = 2.03,
  weekData = DEFAULT_WEEK,
  monthData = DEFAULT_MONTH,
}: ActivityProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [period, setPeriod] = React.useState<'Week' | 'Month'>('Week')
  const [activeIndex, setActiveIndex] = React.useState(0)

  const data = period === 'Week' ? weekData : monthData
  const clampedIndex = Math.min(activeIndex, data.length - 1)
  const selected = data[clampedIndex]

  function handlePeriodChange(next: 'Week' | 'Month') {
    setPeriod(next)
    setActiveIndex(0)
  }

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-6 p-6', className)}>
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex h-[200px] w-full items-end gap-3 pb-2">
          {[0.5, 0.6, 0.7, 0.8, 0.9].map((h, i) => (
            <Skeleton key={i} className="w-full rounded-lg" style={{ height: `${h * 100}%` }} />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-6 p-6', className)}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-normal uppercase tracking-[0.03em] text-muted-foreground">
            {title}
          </h3>
          <div className="flex items-center gap-1.5">
            <div role="group" aria-label="Time period" className="flex items-center gap-0.5 rounded-full bg-muted p-1">
              {(['Week', 'Month'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={period === option}
                  onClick={() => handlePeriodChange(option)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    period === option
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="rounded-full"
              aria-label="Refresh activity"
              onClick={refresh}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-[32px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground">
              {currency(totalAmount)}
            </p>
            <p className="text-sm font-medium text-muted-foreground">{totalLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1">
            <ArrowUp className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">{changePercent}%</span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1">
        <div className="h-[200px] w-full" aria-hidden={false}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
              onClick={(state) => {
                if (state && typeof state.activeTooltipIndex === 'number') {
                  setActiveIndex(state.activeTooltipIndex)
                }
              }}
            >
              <YAxis
                width={32}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <XAxis dataKey="label" hide />
              <Tooltip cursor={{ fill: 'var(--color-muted)' }} content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 8, 8]} maxBarSize={56} className="cursor-pointer">
                {data.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={index === clampedIndex ? 'var(--color-primary)' : 'var(--color-muted)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{selected.label}</span> · {currency(selected.value)}
        </p>
      </div>
    </Card>
  )
}

export default Activity

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
