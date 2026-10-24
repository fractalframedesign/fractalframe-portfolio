'use client'

import { ChevronDown, Minus, MoreHorizontal, Plus, Target } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Separator } from '@/components/project-demos/fintech-components/ui/separator'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SavingsGoal {
  id: string
  label: string
  emoji: string
  balance: number
  target: number
  endDate: string
}

export interface SavingsProps {
  className?: string
  loading?: boolean
  goals?: SavingsGoal[]
  contributionStep?: number
  history?: { date: string; amount: number }[]
}

const defaultGoals: SavingsGoal[] = [
  { id: 'car', label: 'For Car', emoji: '🚘', balance: 12300, target: 25600, endDate: '9 Dec, 2028' },
  { id: 'vacation', label: 'For Vacation', emoji: '🏖️', balance: 3200, target: 8000, endDate: '15 Jun, 2026' },
  { id: 'emergency', label: 'Emergency Fund', emoji: '🛟', balance: 9400, target: 15000, endDate: '1 Jan, 2027' },
]

const defaultHistory = [
  { date: 'Sep 18', amount: 150 },
  { date: 'Sep 4', amount: 200 },
  { date: 'Aug 21', amount: 100 },
]

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const SEGMENTS = 36

export function Savings({
  className,
  loading: loadingProp,
  goals = defaultGoals,
  contributionStep = 50,
  history = defaultHistory,
}: SavingsProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [goalId, setGoalId] = React.useState(goals[0]?.id)
  const [balances, setBalances] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(goals.map((g) => [g.id, g.balance])),
  )
  const [goalMenuOpen, setGoalMenuOpen] = React.useState(false)
  const [actionsOpen, setActionsOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const goalMenuRef = React.useRef<HTMLDivElement>(null)
  const actionsRef = React.useRef<HTMLDivElement>(null)

  const goal = goals.find((g) => g.id === goalId) ?? goals[0]
  const balance = balances[goal.id] ?? goal.balance
  const percent = Math.min(100, Math.round((balance / goal.target) * 100))
  const filled = Math.round((percent / 100) * SEGMENTS)

  React.useEffect(() => {
    if (!goalMenuOpen && !actionsOpen) return
    function onPointerDown(e: PointerEvent) {
      if (goalMenuOpen && goalMenuRef.current && !goalMenuRef.current.contains(e.target as Node)) {
        setGoalMenuOpen(false)
      }
      if (actionsOpen && actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActionsOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [goalMenuOpen, actionsOpen])

  function adjustBalance(delta: number) {
    setBalances((prev) => ({
      ...prev,
      [goal.id]: Math.max(0, Math.min(goal.target, (prev[goal.id] ?? goal.balance) + delta)),
    }))
    setActionsOpen(false)
  }

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-4 p-6', className)}>
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="size-[114px] rounded-full" />
          </div>
          <div className="flex w-full gap-4">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="size-12 shrink-0 rounded-full" />
          </div>
        </div>
        <Separator />
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-4 p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Savings</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh savings"
          onClick={refresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div ref={goalMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={goalMenuOpen}
                onClick={() => setGoalMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-md text-base font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {goal.label}
                <ChevronDown className={cn('size-5 transition-transform', goalMenuOpen && 'rotate-180')} />
              </button>
              {goalMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Select savings goal"
                  className="absolute left-0 top-full z-10 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
                >
                  {goals.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      role="option"
                      aria-selected={g.id === goal.id}
                      onClick={() => {
                        setGoalId(g.id)
                        setGoalMenuOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        g.id === goal.id && 'bg-accent/60 font-medium',
                      )}
                    >
                      <span>{g.emoji}</span>
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(balance)}</p>
              <p className="text-base font-medium text-muted-foreground">End: {goal.endDate}</p>
            </div>
          </div>
          <div className="flex size-[114px] shrink-0 items-center justify-center rounded-full bg-secondary text-5xl">
            {goal.emoji}
          </div>
        </div>

        <div className="flex w-full items-center gap-4">
          <div ref={actionsRef} className="relative flex-1">
            <Button className="w-full rounded-xl px-3 py-6" onClick={() => setActionsOpen((v) => !v)} aria-expanded={actionsOpen} aria-haspopup="menu">
              <Plus className="size-5" />
              Actions
            </Button>
            {actionsOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-10 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => adjustBalance(contributionStep)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Plus className="size-4" />
                  Add {formatCurrency(contributionStep)}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => adjustBalance(-contributionStep)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Minus className="size-4" />
                  Withdraw {formatCurrency(contributionStep)}
                </button>
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            className="flex-1 rounded-xl px-3 py-6"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-expanded={historyOpen}
          >
            History
          </Button>
          <Button variant="secondary" size="icon" className="size-12 shrink-0 rounded-full" aria-label="More options">
            <MoreHorizontal className="size-5" />
          </Button>
        </div>

        {historyOpen && (
          <div className="flex w-full flex-col gap-2 rounded-xl bg-secondary p-4 text-sm">
            {history.map((h) => (
              <div key={h.date} className="flex items-center justify-between">
                <span className="text-muted-foreground">{h.date}</span>
                <span className="font-medium text-success">+{formatCurrency(h.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-muted-foreground" />
            <p className="text-base font-medium text-muted-foreground">Your Progress</p>
          </div>
          <p className="text-base font-semibold text-primary">{percent}%</p>
        </div>
        <div className="flex h-10 w-full items-center justify-between gap-[3px]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className={cn('h-full w-full rounded-full bg-primary transition-opacity duration-500', i >= filled && 'opacity-15')}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

export default Savings

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
