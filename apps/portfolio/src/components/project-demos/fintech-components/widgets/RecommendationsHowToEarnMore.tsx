'use client'

import { ArrowUpRight, MoreHorizontal, TrendingUp } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface EarnTip {
  key: string
  label: string
  value: string
  cta: string
  detail: string
}

export interface RecommendationsHowToEarnMoreProps {
  totalSaved?: string
  changePercent?: string
  daysAgo?: number
  unpaidPercent?: number
  daysLeft?: number
  tips?: [EarnTip, EarnTip]
  /** Force the loading/skeleton state (story control override) */
  loading?: boolean
  className?: string
}

const DEFAULT_TIPS: [EarnTip, EarnTip] = [
  {
    key: 'track',
    label: 'Track your expenses',
    value: 'Save 12%',
    cta: 'View Tips',
    detail: 'Reviewing your top 3 spend categories weekly typically trims 12% off discretionary spend.',
  },
  {
    key: 'cashback',
    label: 'Use cashback programs',
    value: 'Save on purchases',
    cta: 'Explore Offers',
    detail: 'Routing everyday purchases through partner cashback offers earns extra rewards automatically.',
  },
]

/** Progress segments: purple = elapsed, faded = remaining */
const SEGMENTS = 30

export function RecommendationsHowToEarnMore({
  totalSaved = '$14,300.00',
  changePercent = '2.03%',
  daysAgo = 18,
  unpaidPercent = 12,
  daysLeft = 12,
  tips = DEFAULT_TIPS,
  loading: forcedLoading,
  className,
}: RecommendationsHowToEarnMoreProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [openTip, setOpenTip] = React.useState<string | null>(null)

  const elapsedSegments = Math.round((SEGMENTS * daysAgo) / (daysAgo + daysLeft))

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-[41px] w-full rounded-sm" />
        <div className="flex gap-3">
          <Skeleton className="h-[151px] flex-1 rounded-xl" />
          <Skeleton className="h-[151px] flex-1 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-base uppercase tracking-wide text-muted-foreground">
            Recommendations: how to save more
          </p>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="rounded-full"
            aria-label="Refresh recommendations"
            onClick={refresh}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-[32px] font-semibold leading-tight tracking-tight text-foreground">{totalSaved}</p>
            <p className="text-xs font-medium text-muted-foreground">Total amount saved</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
            <TrendingUp className="size-5 text-primary" />
            <span className="text-lg font-medium text-primary">{changePercent}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center gap-1" role="img" aria-label={`${daysAgo} days ago, ${unpaidPercent}% unpaid, ${daysLeft} days left`}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-[41px] flex-1 rounded-sm transition-colors',
                i < elapsedSegments ? 'bg-primary' : 'bg-primary/25',
              )}
            />
          ))}
        </div>
        <div className="flex w-full items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
          <span className="whitespace-nowrap">{daysAgo} days ago</span>
          <span className="h-px flex-1 bg-border" />
          <span className="whitespace-nowrap">Unpaid ({unpaidPercent}%)</span>
          <span className="h-px flex-1 bg-border" />
          <span className="whitespace-nowrap">{daysLeft} days left</span>
        </div>
      </div>

      <div className="flex items-stretch gap-3">
        {tips.map((tip) => {
          const isOpen = openTip === tip.key
          return (
            <div
              key={tip.key}
              className="flex h-[151px] flex-1 flex-col justify-between gap-3 rounded-xl bg-muted p-4"
            >
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-muted-foreground">{tip.label}</p>
                <p className="text-lg font-semibold text-foreground">{tip.value}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenTip(isOpen ? null : tip.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-2 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {tip.cta}
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          )
        })}
      </div>

      {openTip && (
        <p className="text-xs text-muted-foreground">{tips.find((t) => t.key === openTip)?.detail}</p>
      )}
    </div>
  )
}

export default RecommendationsHowToEarnMore

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
