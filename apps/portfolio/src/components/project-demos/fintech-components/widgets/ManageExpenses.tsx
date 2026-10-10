'use client'

import { Check, ChevronRight, RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const blob1 = '/images/projects/fintech-components/manage-expenses/blob-1.svg'
const blob2 = '/images/projects/fintech-components/manage-expenses/blob-2.svg'

export interface ManageExpensesProps {
  loading?: boolean
  className?: string
  heading?: string
  description?: string
  ctaLabel?: string
  tips?: string[]
}

const DEFAULT_TIPS = [
  'Track every transaction as it happens',
  'Set category budgets and get alerts',
  'Review your spending trends weekly',
]

export function ManageExpenses({
  loading: loadingProp,
  className,
  heading = 'How to manage your expenses?',
  description = 'Keeping track of your expenses is essential for financial health.',
  ctaLabel = 'Learn More',
  tips = DEFAULT_TIPS,
}: ManageExpensesProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [expanded, setExpanded] = React.useState(false)

  if (loading) {
    return (
      <div
        className={cn(
          'flex max-w-[480px] flex-col justify-end gap-10 rounded-2xl bg-foreground p-6 pt-[122px]',
          className,
        )}
      >
        <div className="flex h-[170px] flex-col justify-center gap-5">
          <Skeleton className="h-10 w-full bg-background/10" />
          <Skeleton className="h-10 w-4/5 bg-background/10" />
          <Skeleton className="h-4 w-3/4 bg-background/10" />
        </div>
        <Skeleton className="h-[60px] w-full rounded-2xl bg-background/10" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex max-w-[480px] flex-col justify-end gap-10 overflow-hidden rounded-2xl bg-foreground p-6 pt-[122px]',
        className,
      )}
    >
      <img
        src={blob1}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-[183px] -top-[225px] w-[606px] max-w-none"
      />
      <img
        src={blob2}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[84px] -left-[72px] w-[350px] max-w-none"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-4 top-4 z-10 rounded-full bg-background/10 text-background hover:bg-background/20 hover:text-background"
        aria-label="Refresh tips"
        onClick={refresh}
      >
        <RefreshCw className="size-4" />
      </Button>

      <div className="relative z-10 flex flex-col gap-5 text-background">
        <p className="text-[40px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[48px]">{heading}</p>
        <p className="max-w-[248px] text-base font-medium tracking-[0.01em] text-background/70">{description}</p>
      </div>

      {expanded && (
        <ul className="relative z-10 flex flex-col gap-2 rounded-xl bg-background/10 p-4">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm font-medium text-background">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {tip}
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        className="relative z-10 w-full gap-1.5 rounded-2xl py-5 text-lg font-bold"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {ctaLabel}
        <ChevronRight className={cn('size-4.5 transition-transform', expanded && 'rotate-90')} />
      </Button>
    </div>
  )
}

export default ManageExpenses

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
