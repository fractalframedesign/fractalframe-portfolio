'use client'

import { ChevronRight, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/project-demos/fintech-components/ui/badge'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface Recommendation {
  key: string
  title: string
  detail: string
}

export interface AiRecommendationsProps {
  description?: string
  showNewBadge?: boolean
  recommendations?: Recommendation[]
  /** Force the loading/skeleton state (story control override) */
  loading?: boolean
  className?: string
}

const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  {
    key: 'track',
    title: 'Track daily expenses to save up to 10%',
    detail:
      'Logging small purchases as they happen surfaces habits you can cut, typically freeing up 10% of monthly spend.',
  },
  {
    key: 'budget',
    title: 'Save 15% with smarter budgeting',
    detail: 'Splitting your budget into weekly caps per category keeps you on pace and avoids month-end overspend.',
  },
  {
    key: 'subscriptions',
    title: 'Cancel unused subscriptions',
    detail: 'You have 3 recurring charges with no activity in 60+ days — canceling them saves about $27/month.',
  },
  {
    key: 'autopay',
    title: 'Automate savings transfers',
    detail: 'Scheduling a $50 transfer every payday builds a buffer without you having to think about it.',
  },
]

export function AiRecommendations({
  description = 'Learn how to save more',
  showNewBadge = true,
  recommendations = DEFAULT_RECOMMENDATIONS,
  loading: forcedLoading,
  className,
}: AiRecommendationsProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [openKey, setOpenKey] = React.useState<string | null>(null)
  const [expandedAll, setExpandedAll] = React.useState(false)

  const visible = expandedAll ? recommendations : recommendations.slice(0, 3)

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <Skeleton className="size-9 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[50px] w-full rounded-xl" />
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-base uppercase tracking-wide text-muted-foreground">
              AI Recommendations
            </p>
            {showNewBadge && (
              <Badge className="rounded-full bg-primary px-3 py-0.5 text-primary-foreground">New</Badge>
            )}
          </div>
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
        <p className="text-base text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-2">
        {visible.map((rec, i) => {
          const isOpen = openKey === rec.key
          return (
            <div key={rec.key} className="w-full">
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : rec.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 rounded-lg py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-base font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-base font-semibold text-foreground">{rec.title}</span>
                  <ChevronRight
                    className={cn('size-5 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-90')}
                  />
                </span>
              </button>
              {isOpen && (
                <p className="px-1 pb-1 pl-[52px] pr-2 text-sm text-muted-foreground">{rec.detail}</p>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setExpandedAll((v) => !v)}
        className="flex h-[50px] w-full items-center justify-center rounded-xl bg-secondary text-base font-semibold text-foreground transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {expandedAll ? 'Show Less' : 'View Full'}
      </button>
    </div>
  )
}

export default AiRecommendations

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
