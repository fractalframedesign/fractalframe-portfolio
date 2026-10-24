'use client'

import { Cake,Car, ChevronDown, Home, RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SavingsGoal {
  id: string
  name: string
  until: string
  saved: number
  target: number
  icon: 'wedding' | 'house' | 'car'
}

export interface Savings3Props {
  className?: string
  loading?: boolean
  showHeader?: boolean
  showFooter?: boolean
  title?: string
  goals?: SavingsGoal[]
  balance?: number
}

const defaultGoals: SavingsGoal[] = [
  { id: 'wedding', name: 'Wedding', until: 'Sep 18, 2026', saved: 18000, target: 24000, icon: 'wedding' },
  { id: 'house', name: 'House', until: 'Nov 29, 2025', saved: 32000, target: 72000, icon: 'house' },
  { id: 'car', name: 'New Car', until: 'May 22, 2027', saved: 8000, target: 27000, icon: 'car' },
]

const ICONS: Record<SavingsGoal['icon'], React.ComponentType<{ className?: string }>> = {
  wedding: Cake,
  house: Home,
  car: Car,
}

function RadialProgress({ percent }: { percent: number }) {
  const size = 58
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  return (
    <div className="relative flex size-[58px] shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity={0.2}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute font-medium text-primary text-sm tracking-tight">{Math.round(percent)}%</span>
    </div>
  )
}

function GoalRow({ goal, expanded, onToggle }: { goal: SavingsGoal; expanded: boolean; onToggle: () => void }) {
  const Icon = ICONS[goal.icon]
  const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100))
  const remaining = Math.max(0, goal.target - goal.saved)
  return (
    <div className="w-full rounded-xl bg-muted">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex w-[45%] min-w-0 items-center gap-4">
          <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-accent">
            <Icon className="size-6 text-accent-foreground" />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-medium text-foreground text-lg">{goal.name}</span>
            <span className="truncate text-muted-foreground text-xs">Until &bull; {goal.until}</span>
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground tabular-nums">${goal.saved.toLocaleString('en-US')}</span>
          <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
          <span className="text-foreground tabular-nums">${goal.target.toLocaleString('en-US')}</span>
        </div>
        <RadialProgress percent={percent} />
      </button>
      {expanded && (
        <div className="flex items-center justify-between gap-4 border-border/60 border-t px-3 py-3 text-sm">
          <span className="text-muted-foreground">Remaining to reach goal</span>
          <span className="font-medium text-foreground tabular-nums">${remaining.toLocaleString('en-US')}</span>
        </div>
      )}
    </div>
  )
}

export function Savings3({
  className,
  loading: forcedLoading,
  showHeader = true,
  showFooter = true,
  title = 'Savings',
  goals = defaultGoals,
  balance = 24425,
}: Savings3Props) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const savedPercent = Math.round(
    (goals.reduce((sum, g) => sum + g.saved, 0) / goals.reduce((sum, g) => sum + g.target, 0)) * 100,
  )

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        )}
        <div className="flex w-full flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex w-full items-center gap-4 rounded-xl bg-muted p-3">
              <Skeleton className="size-[52px] shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="size-[58px] shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      {showHeader && (
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-secondary"
            aria-label={`Refresh ${title}`}
            onClick={refresh}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      )}
      <div className="flex w-full flex-col gap-3">
        {goals.map((goal) => (
          <GoalRow
            key={goal.id}
            goal={goal}
            expanded={expandedId === goal.id}
            onToggle={() => setExpandedId((cur) => (cur === goal.id ? null : goal.id))}
          />
        ))}
      </div>
      {showFooter && (
        <div className="flex w-full items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Saved: <span className="font-medium text-foreground">{savedPercent}%</span>
          </p>
          <p className="text-muted-foreground">
            Balance: <span className="font-medium text-foreground">${balance.toLocaleString('en-US')}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Savings3

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
