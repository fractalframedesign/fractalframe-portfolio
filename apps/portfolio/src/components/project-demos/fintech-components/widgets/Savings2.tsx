'use client'

import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SavingsRing {
  id: string
  name: string
  saved: number
  target: number
}

export interface Savings2Props {
  loading?: boolean
  className?: string
  showHeader?: boolean
  title?: string
  totalLabel?: string
  totalAmount?: number
  changePercent?: number
  balance?: number
  goals?: SavingsRing[]
}

const DEFAULT_GOALS: SavingsRing[] = [
  { id: 'wedding', name: 'Wedding', saved: 9890, target: 10800 },
  { id: 'house', name: 'House', saved: 3265, target: 6000 },
  { id: 'car', name: 'Car', saved: 1145, target: 8500 },
]

function Ring({
  percent,
  selected,
  onSelect,
  name,
  amount,
}: {
  percent: number
  selected: boolean
  onSelect: () => void
  name: string
  amount: number
}) {
  const size = 150
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${name}, ${percent}% saved, $${amount.toLocaleString('en-US')}`}
      className={cn(
        'relative flex size-[150px] shrink-0 items-center justify-center rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'scale-[1.04]',
      )}
    >
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
          strokeDasharray="1 7"
          strokeLinecap="round"
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
      <span className="absolute flex flex-col items-center gap-1">
        <span className="text-lg font-semibold text-foreground">{name}</span>
        <span className="text-base font-medium text-muted-foreground">${amount.toLocaleString('en-US')}</span>
      </span>
    </button>
  )
}

export function Savings2({
  loading: loadingProp,
  className,
  showHeader = true,
  title = 'Savings',
  totalLabel = 'Total amount saved',
  totalAmount = 14300,
  changePercent = 2.03,
  balance = 24425,
  goals = DEFAULT_GOALS,
}: Savings2Props) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [selectedId, setSelectedId] = React.useState(goals[0]?.id ?? '')
  const selectedGoal = goals.find((g) => g.id === selectedId) ?? goals[0]

  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0)
  const savedPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-10 p-6', className)}>
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="size-[150px] shrink-0 rounded-full" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-10 p-6', className)}>
      {showHeader && (
      <div className="flex w-full flex-col gap-2">
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
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm font-medium text-muted-foreground">{totalLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-1">
            <span className="text-sm font-medium text-primary">+{changePercent}%</span>
          </div>
        </div>
      </div>
      )}

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-between gap-3">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100))
            return (
              <Ring
                key={goal.id}
                percent={percent}
                selected={goal.id === selectedId}
                onSelect={() => setSelectedId(goal.id)}
                name={goal.name}
                amount={goal.saved}
              />
            )
          })}
        </div>
        {selectedGoal && (
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{selectedGoal.name}</span>: $
            {selectedGoal.saved.toLocaleString('en-US')} of ${selectedGoal.target.toLocaleString('en-US')} saved
          </p>
        )}
        <div className="flex w-full items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Saved: <span className="font-medium text-foreground">{savedPercent}%</span>
          </p>
          <p className="text-muted-foreground">
            Balance: <span className="font-medium text-foreground">${balance.toLocaleString('en-US')}</span>
          </p>
        </div>
      </div>
    </Card>
  )
}

export default Savings2

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
