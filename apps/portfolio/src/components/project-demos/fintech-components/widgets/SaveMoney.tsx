'use client'

import { ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/project-demos/fintech-components/ui/badge'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SavePlan {
  id: 'easy' | 'medium' | 'hard'
  label: string
  months: number
  perMonth: string
}

export interface SaveMoneyProps {
  className?: string
  loading?: boolean
  showHeader?: boolean
  title?: string
  isNew?: boolean
  periodLabel?: string
  targetAmount?: string
  plans?: SavePlan[]
}

const defaultPlans: SavePlan[] = [
  { id: 'easy', label: 'Easy', months: 8, perMonth: '$450/m' },
  { id: 'medium', label: 'Medium', months: 6, perMonth: '$600/m' },
  { id: 'hard', label: 'Hard', months: 4, perMonth: '$900/m' },
]

export function SaveMoney({
  className,
  loading: forcedLoading,
  showHeader = true,
  title = 'Save Money',
  isNew = true,
  periodLabel = '6 Month',
  targetAmount = '$50,000.00',
  plans = defaultPlans,
}: SaveMoneyProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [selectedPlan, setSelectedPlan] = React.useState<SavePlan['id']>('medium')

  const active = plans.find((p) => p.id === selectedPlan) ?? plans[1]
  const positionPercent = { easy: 0, medium: 50, hard: 100 }[selectedPlan]

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-8 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>
        )}
        <div className="flex w-full flex-col items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex w-full flex-col gap-8">
          <Skeleton className="h-8 w-full rounded-full" />
          <div className="flex w-full justify-between">
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-12 w-16" />
          </div>
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-8 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      {showHeader && (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
            {isNew && <Badge className="bg-primary px-3 py-0.5 text-base font-semibold text-primary-foreground">New</Badge>}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-2 text-sm font-medium text-muted-foreground outline-none hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {periodLabel}
              <ChevronDown className="size-6" />
            </button>
            <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh savings plan" onClick={refresh}>
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex w-full flex-col items-center gap-1">
        <p className="text-lg font-medium text-muted-foreground">Period</p>
        <p className="text-[48px] leading-[1.15] font-semibold tracking-[-1.44px] text-foreground">{active.months} Month</p>
        <p className="text-2xl font-semibold tracking-[0.24px] text-foreground">{targetAmount}</p>
      </div>

      <div className="flex w-full flex-col gap-8">
        <div className="relative flex h-8 w-full items-center">
          <div className="absolute h-4 w-full overflow-hidden rounded-full bg-gradient-to-r from-[#00e5c3] via-[#14c1f9] to-[#711bfe]" />
          <input
            type="range"
            min={0}
            max={100}
            step={50}
            value={positionPercent}
            onChange={(e) => {
              const v = Number(e.target.value)
              setSelectedPlan(v === 0 ? 'easy' : v === 50 ? 'medium' : 'hard')
            }}
            aria-label="Select savings difficulty"
            className="relative z-10 h-8 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-webkit-slider-thumb]:size-[34px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border [&::-webkit-slider-thumb]:bg-card [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:size-[34px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-border [&::-moz-range-thumb]:bg-card [&::-moz-range-thumb]:shadow-lg"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              aria-pressed={selectedPlan === plan.id}
              className={cn(
                'flex w-[70px] flex-col items-center gap-1 rounded-lg py-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring',
                plan.id === 'medium' ? 'items-center' : plan.id === 'hard' ? 'items-end text-right' : 'items-start text-left',
              )}
            >
              <span
                className={cn(
                  'text-lg font-semibold',
                  selectedPlan === plan.id ? 'text-primary' : 'text-foreground',
                )}
              >
                {plan.label}
              </span>
              <span className="flex flex-col text-sm text-muted-foreground">
                <span>{plan.months} Month</span>
                <span>{plan.perMonth}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SaveMoney

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
