'use client'

import { ArrowUp, Check, ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface ActivityPoint {
  label: string
  value: number
}

export interface DateRangeOption {
  id: string
  label: string
  data: ActivityPoint[]
}

export interface Activity1Props {
  loading?: boolean
  className?: string
  showHeader?: boolean
  title?: string
  totalLabel?: string
  totalAmount?: number
  changePercent?: number
  ranges?: DateRangeOption[]
}

const DEFAULT_RANGES: DateRangeOption[] = [
  {
    id: 'months',
    label: 'Last 5 months',
    data: [
      { label: 'Jan', value: 48000 },
      { label: 'Feb', value: 58000 },
      { label: 'Mar', value: 52000 },
      { label: 'Apr', value: 62000 },
      { label: 'May', value: 71000 },
    ],
  },
  {
    id: 'weeks',
    label: 'Last 6 weeks',
    data: [
      { label: 'W1', value: 31000 },
      { label: 'W2', value: 36000 },
      { label: 'W3', value: 33000 },
      { label: 'W4', value: 42000 },
      { label: 'W5', value: 39000 },
      { label: 'W6', value: 47000 },
    ],
  },
  {
    id: 'year',
    label: 'This year',
    data: [
      { label: 'Q1', value: 152000 },
      { label: 'Q2', value: 178000 },
      { label: 'Q3', value: 165000 },
      { label: 'Q4', value: 201000 },
    ],
  },
]

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ActivityPoint }> }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background shadow-md">
      {point.label} &bull; {currency(point.value)}
    </div>
  )
}

export function Activity1({
  loading: loadingProp,
  className,
  showHeader = true,
  title = 'Activity',
  totalLabel = 'Recent account activity',
  totalAmount = 14300,
  changePercent = 2.03,
  ranges = DEFAULT_RANGES,
}: Activity1Props) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [rangeIndex, setRangeIndex] = React.useState(0)
  const [menuOpen, setMenuOpen] = React.useState(false)

  const range = ranges[rangeIndex] ?? ranges[0]
  const data = range.data
  const maxValue = Math.max(...data.map((d) => d.value))

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-6 p-6', className)}>
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-[232px] w-full rounded-xl" />
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-6 p-6', className)}>
      {showHeader && (
      <div className="flex w-full flex-col gap-3">
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
                {range.label}
                <ChevronDown className={cn('size-4 transition-transform', menuOpen && 'rotate-180')} />
              </Button>
              {menuOpen && (
                <div
                  role="listbox"
                  aria-label="Select date range"
                  className="absolute right-0 top-full z-10 mt-1.5 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md"
                >
                  {ranges.map((option, index) => (
                    <button
                      key={option.id}
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
                      {option.label}
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

      <div className="h-[232px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="activity1Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="4 4" />
            <YAxis
              width={36}
              domain={[0, Math.ceil((maxValue * 1.15) / 10000) * 10000]}
              tickFormatter={(v) => `${Math.round(v / 1000)}K`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              padding={{ left: 12, right: 12 }}
            />
            <Tooltip cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#activity1Fill)"
              dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'var(--color-primary)', strokeWidth: 2, stroke: 'var(--color-card)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default Activity1

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
