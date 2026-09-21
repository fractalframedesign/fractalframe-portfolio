'use client'

import { Cloud, MoreHorizontal, Music2, PenTool, Tv } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { Switch } from '@/components/project-demos/fintech-components/ui/switch'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface Subscription {
  id: string
  name: string
  price: number
  icon: 'netflix' | 'spotify' | 'figma' | 'icloud'
  active: boolean
}

export interface MonthlySubscriptionsProps {
  loading?: boolean
  className?: string
  showHeader?: boolean
  title?: string
  changePercent?: number
  subscriptions?: Subscription[]
}

const ICONS: Record<Subscription['icon'], React.ComponentType<{ className?: string }>> = {
  netflix: Tv,
  spotify: Music2,
  figma: PenTool,
  icloud: Cloud,
}

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  { id: 'netflix', name: 'Netflix', price: 24, icon: 'netflix', active: true },
  { id: 'spotify', name: 'Spotify', price: 13, icon: 'spotify', active: false },
  { id: 'figma', name: 'Figma', price: 24, icon: 'figma', active: false },
  { id: 'icloud', name: 'Icloud', price: 50, icon: 'icloud', active: true },
]

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

export function MonthlySubscriptions({
  loading: loadingProp,
  className,
  showHeader = true,
  title = 'Monthly Subscriptions',
  changePercent = 2.03,
  subscriptions = DEFAULT_SUBSCRIPTIONS,
}: MonthlySubscriptionsProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [active, setActive] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(subscriptions.map((s) => [s.id, s.active])),
  )

  const totalActive = subscriptions.reduce((sum, s) => sum + (active[s.id] ? s.price : 0), 0)

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-5 p-6', className)}>
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl bg-muted p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
              <div className="flex w-full items-end justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-5 p-6', className)}>
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
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-[32px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground tabular-nums">
              {currency(totalActive)}
            </p>
            <p className="text-sm font-medium text-muted-foreground">Active monthly cost</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-1">
            <span className="text-sm font-medium text-primary">+{changePercent}%</span>
          </div>
        </div>
      </div>
      )}

      <div className="grid w-full grid-cols-2 gap-2">
        {subscriptions.map((sub) => {
          const Icon = ICONS[sub.icon]
          const isActive = active[sub.id] ?? sub.active
          return (
            <div key={sub.id} className="flex flex-col justify-center gap-3 rounded-xl bg-muted p-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground">
                  <Icon className="size-5 text-background" />
                </span>
                <p className="truncate text-xs font-semibold text-foreground">{sub.name}</p>
              </div>
              <div className="flex w-full items-end justify-between gap-2">
                <p className="text-lg font-semibold text-foreground">
                  ${sub.price}
                  <span className="text-muted-foreground">/month</span>
                </p>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => setActive((prev) => ({ ...prev, [sub.id]: checked }))}
                  aria-label={`${isActive ? 'Disable' : 'Enable'} ${sub.name} subscription`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default MonthlySubscriptions

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
