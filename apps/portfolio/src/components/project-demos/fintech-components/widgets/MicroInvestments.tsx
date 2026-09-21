'use client'

import { ArrowUp, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/project-demos/fintech-components/ui/badge'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Separator } from '@/components/project-demos/fintech-components/ui/separator'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface InvestmentCategory {
  id: string
  label: string
  heightPercent: number
  amount: string
  percent: string
}

export interface MicroInvestmentsProps {
  className?: string
  loading?: boolean
  showHeader?: boolean
  title?: string
  isNew?: boolean
  totalInvested?: string
  interestPercent?: string
  categories?: InvestmentCategory[]
}

const defaultCategories: InvestmentCategory[] = [
  { id: 'spare', label: 'Spare Change', heightPercent: 65, amount: '$750', percent: '42%' },
  { id: 'contributions', label: 'Contributions', heightPercent: 100, amount: '$1,145', percent: '65%' },
  { id: 'returns', label: 'Returns', heightPercent: 39, amount: '$310', percent: '18%' },
  { id: 'profit', label: 'Profit', heightPercent: 30, amount: '$235', percent: '13%' },
]

export function MicroInvestments({
  className,
  loading: forcedLoading,
  showHeader = true,
  title = 'Micro-Investments',
  isNew = true,
  totalInvested = '$1,495.00',
  interestPercent = '2.03%',
  categories = defaultCategories,
}: MicroInvestmentsProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [activeId, setActiveId] = React.useState(categories[0]?.id ?? '')

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-8 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
              <Skeleton className="size-9 rounded-full" />
            </div>
            <div className="flex w-full items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          </div>
        )}
        <Skeleton className="h-px w-full" />
        <div className="flex w-full items-end justify-between gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[104px] flex-1 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-8 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      {showHeader && (
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
              {isNew && <Badge className="bg-primary px-3 py-0.5 text-base font-semibold text-primary-foreground">New</Badge>}
            </div>
            <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh investments" onClick={refresh}>
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-3xl font-semibold tracking-[-0.32px] text-foreground">{totalInvested}</p>
              <p className="text-sm font-medium tracking-[0.14px] text-muted-foreground">Total invested</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-lg font-medium text-primary">
              <ArrowUp className="size-6" />
              {interestPercent}
            </span>
          </div>
        </div>
      )}

      <Separator />

      <div className="flex w-full flex-col gap-6">
        <div className="flex h-[104px] w-full items-end gap-3">
          {categories.map((cat) => {
            const isActive = cat.id === activeId
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveId(cat.id)}
                aria-pressed={isActive}
                aria-label={`${cat.label}: ${cat.amount} (${cat.percent})`}
                className={cn(
                  'relative flex flex-1 flex-col justify-end overflow-hidden rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive ? 'bg-primary' : 'bg-muted hover:bg-muted/70',
                )}
                style={{ height: `${cat.heightPercent}%` }}
              >
                {isActive && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background shadow-lg">
                    {cat.amount} ({cat.percent})
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex w-full items-center justify-between text-sm font-medium tracking-[0.14px] text-muted-foreground">
          {categories.map((cat) => (
            <span key={cat.id} className={cn('flex-1 text-center', cat.id === activeId && 'font-semibold text-primary')}>
              {cat.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MicroInvestments

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
