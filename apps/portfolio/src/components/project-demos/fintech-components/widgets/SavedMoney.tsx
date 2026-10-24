'use client'

import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SavedMoneyLegendItem {
  label: string
  value: string
  color: string
}

export interface SavedMoneyPeriod {
  id: string
  label: string
  percent: number
  delta: string
  legend: SavedMoneyLegendItem[]
}

export interface SavedMoneyProps {
  loading?: boolean
  className?: string
  showHeader?: boolean
  title?: string
  balance?: number
  periods?: SavedMoneyPeriod[]
}

const DEFAULT_PERIODS: SavedMoneyPeriod[] = [
  {
    id: 'week',
    label: 'Week',
    percent: 72,
    delta: '+456',
    legend: [
      { label: 'Saved this week', value: '$1,120', color: 'var(--color-primary)' },
      { label: 'Saved last week', value: '$980', color: 'var(--color-chart-2)' },
      { label: 'Spent this week', value: '$420', color: 'var(--color-chart-3)' },
    ],
  },
  {
    id: 'month',
    label: 'Month',
    percent: 58,
    delta: '+1,240',
    legend: [
      { label: 'Saved this month', value: '$4,820', color: 'var(--color-primary)' },
      { label: 'Saved last month', value: '$3,910', color: 'var(--color-chart-2)' },
      { label: 'Spent this month', value: '$2,650', color: 'var(--color-chart-3)' },
    ],
  },
  {
    id: 'year',
    label: 'Year',
    percent: 84,
    delta: '+9,830',
    legend: [
      { label: 'Saved this year', value: '$52,300', color: 'var(--color-primary)' },
      { label: 'Saved last year', value: '$41,760', color: 'var(--color-chart-2)' },
      { label: 'Spent this year', value: '$18,420', color: 'var(--color-chart-3)' },
    ],
  },
]

function DashRing({ percent, size = 184, dashCount = 48 }: { percent: number; size?: number; dashCount?: number }) {
  const filled = Math.round((percent / 100) * dashCount)
  const radius = size / 2 - 8
  const center = size / 2
  const items = Array.from({ length: dashCount }, (_, i) => i)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      {items.map((i) => {
        const angle = (i / dashCount) * 360
        const isFilled = i < filled
        const color = isFilled
          ? i < filled * 0.6
            ? 'var(--color-primary)'
            : 'var(--color-chart-2)'
          : 'var(--color-muted)'
        return (
          <line
            key={i}
            x1={center}
            y1={center - radius - 5}
            x2={center}
            y2={center - radius + 5}
            stroke={color}
            strokeWidth={3.5}
            strokeLinecap="round"
            transform={`rotate(${angle} ${center} ${center})`}
          />
        )
      })}
    </svg>
  )
}

export function SavedMoney({
  loading: loadingProp,
  className,
  showHeader = true,
  title = 'Saved Money',
  balance = 24425,
  periods = DEFAULT_PERIODS,
}: SavedMoneyProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [periodIndex, setPeriodIndex] = React.useState(0)
  const period = periods[periodIndex] ?? periods[0]

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-10 p-6', className)}>
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <div className="flex w-full items-center gap-2">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-6">
          <Skeleton className="size-[184px] shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-10 p-6', className)}>
      {showHeader && (
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-normal uppercase tracking-[0.03em] text-muted-foreground">
            {title}
          </h3>
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
        <div role="tablist" aria-label="Time period" className="flex w-full items-center gap-2">
          {periods.map((option, index) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={index === periodIndex}
              onClick={() => setPeriodIndex(index)}
              className={cn(
                'flex-1 border-b-2 pb-2 pt-2 text-center text-base font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                index === periodIndex
                  ? 'border-primary text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      )}

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="relative shrink-0">
            <DashRing percent={period.percent} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-[32px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground tabular-nums">
                {period.percent}%
              </span>
              <span className="text-base font-medium text-muted-foreground">Saved</span>
            </div>
            <div className="absolute -top-2 right-0 flex translate-x-1/3 items-center gap-1.5">
              <span className="size-3 shrink-0 rounded-full bg-foreground" />
              <span className="rounded-full bg-foreground px-2 py-0.5 text-sm font-semibold text-background">
                {period.delta}
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {period.legend.map((item) => (
              <div key={item.label} className="flex w-full items-center gap-2">
                <span
                  className="size-4 shrink-0 rounded-full border-[5px]"
                  style={{ borderColor: item.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className="shrink-0 text-sm font-medium text-foreground tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Saved: <span className="font-medium text-foreground">{period.percent}%</span>
          </p>
          <p className="text-muted-foreground">
            Balance: <span className="font-medium text-foreground">${balance.toLocaleString('en-US')}</span>
          </p>
        </div>
      </div>
    </Card>
  )
}

export default SavedMoney

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
