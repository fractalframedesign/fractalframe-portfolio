'use client'

import { Plus, Sparkles } from 'lucide-react'
import * as React from 'react'

import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const memojiFemale7 = '/images/projects/fintech-components/discount/memoji-female-7.png'

export interface DiscountProps {
  storeName?: string
  offerText?: string
  discountLabel?: string
  postedDaysAgo?: number
  /** Force the loading/skeleton state (story control override) */
  loading?: boolean
  className?: string
}

export function Discount({
  storeName = 'Cosmetics store',
  offerText = 'Mary offers a 10% discount on cosmetics',
  discountLabel = '10% discount',
  postedDaysAgo = 10,
  loading: forcedLoading,
  className,
}: DiscountProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [claimed, setClaimed] = React.useState(false)

  const handleClaim = () => {
    setClaimed((v) => !v)
    refresh()
  }

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-0 rounded-2xl border border-border bg-card shadow-sm p-1', className)}>
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <div className="flex items-end justify-between gap-4 px-5 pb-5 pt-6">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-0 rounded-2xl border border-border bg-card shadow-sm p-1', className)}>
      <div className="relative flex w-full flex-col items-start overflow-hidden rounded-xl bg-[oklch(0.75_0.16_180)]">
        <div className="flex w-full items-center justify-between p-5">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-base uppercase tracking-wide text-[oklch(0.2_0.01_260)]">
            Discount
          </p>
          <button
            type="button"
            onClick={handleClaim}
            aria-pressed={claimed}
            aria-label={claimed ? 'Remove claimed offer' : 'Claim this offer'}
            className="flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:opacity-85 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className={cn('size-5 transition-transform', claimed && 'rotate-45')} />
          </button>
        </div>
        <div className="relative h-[236px] w-full">
          <div className="absolute bottom-5 left-5 flex min-w-14 items-center gap-1 rounded-full bg-[oklch(0.2_0.01_260)] p-0.5 pr-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-background/10">
              <Sparkles className="size-3.5 text-background" />
            </span>
            <span className="text-xs text-background">{postedDaysAgo} days ago</span>
          </div>
          <img
            src={memojiFemale7}
            alt="Cosmetics store representative avatar"
            className="pointer-events-none absolute left-1/2 top-1/2 size-[251px] -translate-x-1/2 -translate-y-1/2 object-cover"
          />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 px-5 pb-5 pt-6">
        <div className="flex flex-1 flex-col gap-1 text-base tracking-wide">
          <p className="text-muted-foreground">{storeName}</p>
          <p className="text-foreground">{offerText}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
            claimed ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary',
          )}
        >
          {claimed ? 'Claimed' : discountLabel}
        </span>
      </div>
    </div>
  )
}

export default Discount

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
