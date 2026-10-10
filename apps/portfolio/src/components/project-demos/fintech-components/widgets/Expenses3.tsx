'use client'

import {
  Car,
  Heart,
  MoreHorizontal,
  Popcorn,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface ExpenseCategory {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  percent: number
  negative?: boolean
}

export interface Expenses3Props {
  total?: string
  period?: string
  changePercent?: string
  categories?: ExpenseCategory[]
  /** Force the loading/skeleton state (story control override) */
  loading?: boolean
  className?: string
}

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { key: 'groceries', label: 'Groceries', icon: ShoppingCart, percent: 79 },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag, percent: 56 },
  { key: 'food', label: 'Food & Drink', icon: UtensilsCrossed, percent: 48 },
  { key: 'health', label: 'Health', icon: Heart, percent: 28 },
  { key: 'entertainment', label: 'Entertainment', icon: Popcorn, percent: 12 },
  { key: 'transport', label: 'Transport', icon: Car, percent: 6, negative: true },
]

export function Expenses3({
  total = '$14,300.00',
  period = 'March 2024',
  changePercent = '2.03%',
  categories = DEFAULT_CATEGORIES,
  loading: forcedLoading,
  className,
}: Expenses3Props) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [activeKey, setActiveKey] = React.useState<string | null>(null)

  const activeCategory = categories.find((c) => c.key === activeKey) ?? null

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        <div className="flex flex-col gap-2 border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex w-[120px] flex-col justify-between gap-3">
            {DEFAULT_CATEGORIES.map((c) => (
              <div key={c.key} className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col justify-between gap-2.5">
            {DEFAULT_CATEGORIES.map((c) => (
              <Skeleton key={c.key} className="h-6 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex flex-col gap-2 border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-base uppercase tracking-wide text-muted-foreground">
            Your expenses
          </p>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="rounded-full"
            aria-label="Refresh expenses"
            onClick={refresh}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col gap-0.5">
            <p className="text-[32px] font-semibold leading-tight tracking-tight text-foreground">{total}</p>
            <p className="text-sm font-medium text-muted-foreground">{period}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
            <TrendingUp className="size-5 text-primary" />
            <span className="text-lg font-medium text-primary">{changePercent}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex w-[128px] flex-col justify-between gap-3">
          {categories.map((c) => {
            const Icon = c.icon
            const isActive = activeKey === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveKey(isActive ? null : c.key)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center gap-3 rounded-md px-1 py-0.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'text-primary' : 'text-foreground hover:text-primary/80',
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="whitespace-nowrap text-sm font-medium">{c.label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2.5">
          {categories.map((c) => {
            const isActive = activeKey === c.key
            return (
              <div
                key={c.key}
                className={cn(
                  'relative h-6 w-full overflow-hidden rounded-md bg-muted transition-all',
                  isActive && 'ring-2 ring-primary ring-offset-1 ring-offset-card',
                )}
              >
                <div
                  className={cn(
                    'flex h-full items-center justify-end rounded-md px-2 transition-all duration-500',
                    c.negative ? 'bg-destructive' : 'bg-primary',
                  )}
                  style={{ width: `${c.percent}%` }}
                >
                  <span className="translate-x-full whitespace-nowrap pl-2 text-xs font-medium text-primary-foreground">
                    {c.percent}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {activeCategory && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{activeCategory.label}</span> made up{' '}
          {activeCategory.percent}% of relative spend this month.
        </p>
      )}
    </div>
  )
}

export default Expenses3

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
