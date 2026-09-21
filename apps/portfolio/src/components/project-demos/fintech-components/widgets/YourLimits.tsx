'use client'

import { ArrowLeftRight, HandCoins, MoreHorizontal, TrendingUp } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { Slider } from '@/components/project-demos/fintech-components/ui/slider'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface LimitItem {
  id: string
  label: string
  icon: 'withdraw' | 'trades' | 'exchange'
  used: number
  max: number
  isCurrency: boolean
  unit?: string
}

export interface YourLimitsProps {
  className?: string
  loading?: boolean
  showHeader?: boolean
  title?: string
  limits?: LimitItem[]
}

const defaultLimits: LimitItem[] = [
  { id: 'atm', label: 'ATM withdrawals', icon: 'withdraw', used: 0, max: 200, isCurrency: true },
  { id: 'trades', label: 'No commission trades', icon: 'trades', used: 0, max: 1, isCurrency: false, unit: 'trades' },
  { id: 'exchange', label: 'Exchanges', icon: 'exchange', used: 0, max: 1000, isCurrency: true },
]

const ICONS: Record<LimitItem['icon'], React.ComponentType<{ className?: string }>> = {
  withdraw: HandCoins,
  trades: TrendingUp,
  exchange: ArrowLeftRight,
}

function formatValue(value: number, isCurrency: boolean, unit?: string) {
  if (isCurrency) return `$${value.toLocaleString('en-US')}`
  return `${value}${unit ? ` ${unit}` : ''}`
}

export function YourLimits({
  className,
  loading: forcedLoading,
  showHeader = true,
  title = 'Your Limits',
  limits = defaultLimits,
}: YourLimitsProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(limits.map((l) => [l.id, l.used])),
  )
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm px-6 py-5', className)}>
        {showHeader && (
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        )}
        <div className="flex w-full flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex w-full items-center gap-4">
              <Skeleton className="size-[58px] shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-[60px] w-full rounded-2xl" />
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm px-6 py-5 text-card-foreground', className)}>
      {showHeader && (
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
          <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh limits" onClick={refresh}>
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex w-full flex-col gap-5">
        {limits.map((limit) => {
          const Icon = ICONS[limit.icon]
          const value = values[limit.id] ?? limit.used
          const expanded = expandedId === limit.id
          return (
            <div key={limit.id} className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={() => setExpandedId((cur) => (cur === limit.id ? null : limit.id))}
                aria-expanded={expanded}
                className="flex w-full items-center gap-4 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-[58px] shrink-0 items-center justify-center rounded-full border-3 border-card bg-accent p-[5px]">
                  <Icon className="size-6 text-accent-foreground" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-lg font-semibold text-foreground">{limit.label}</span>
                  <span className="max-w-[340px] text-sm font-medium tracking-[0.14px] text-muted-foreground">
                    {formatValue(value, limit.isCurrency, limit.unit)} / {formatValue(limit.max, limit.isCurrency, limit.unit)}
                  </span>
                </span>
              </button>
              {expanded && (
                <div className="flex w-full flex-col gap-2 pl-[74px]">
                  <Slider
                    value={value}
                    min={0}
                    max={limit.max}
                    step={limit.isCurrency ? Math.max(1, Math.round(limit.max / 100)) : 1}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, [limit.id]: v }))}
                    aria-label={`Adjust ${limit.label} usage`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Button size="lg" className="w-full rounded-2xl py-5 text-lg font-bold" onClick={refresh}>
        Change Limits
      </Button>
    </div>
  )
}

export default YourLimits

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
