'use client'

import { ChevronDown, Loader2, MoreHorizontal, Plus } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Separator } from '@/components/project-demos/fintech-components/ui/separator'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SavingsGoalDetail {
  id: string
  name: string
  emoji: string
  amount: number
  target: number
  endDate: string
  history: Array<{ label: string; amount: number; date: string }>
}

export interface Savings4Props {
  loading?: boolean
  className?: string
  showHeader?: boolean
  title?: string
  goals?: SavingsGoalDetail[]
}

const DEFAULT_GOALS: SavingsGoalDetail[] = [
  {
    id: 'car',
    name: 'Car',
    emoji: '🚘',
    amount: 12300,
    target: 25600,
    endDate: '9 Dec, 2028',
    history: [
      { label: 'Auto transfer', amount: 500, date: 'Sep 12, 2026' },
      { label: 'Bonus deposit', amount: 240, date: 'Aug 28, 2026' },
      { label: 'Manual top-up', amount: 150, date: 'Aug 3, 2026' },
    ],
  },
  {
    id: 'wedding',
    name: 'Wedding',
    emoji: '💍',
    amount: 18000,
    target: 24000,
    endDate: '18 Sep, 2027',
    history: [
      { label: 'Auto transfer', amount: 400, date: 'Sep 10, 2026' },
      { label: 'Gift deposit', amount: 600, date: 'Aug 22, 2026' },
      { label: 'Manual top-up', amount: 200, date: 'Aug 1, 2026' },
    ],
  },
  {
    id: 'house',
    name: 'House',
    emoji: '🏠',
    amount: 32000,
    target: 72000,
    endDate: '29 Nov, 2029',
    history: [
      { label: 'Auto transfer', amount: 900, date: 'Sep 14, 2026' },
      { label: 'Manual top-up', amount: 350, date: 'Aug 30, 2026' },
      { label: 'Bonus deposit', amount: 500, date: 'Aug 5, 2026' },
    ],
  },
]

const CONTRIBUTION = 500

function ProgressBars({ percent, bars = 50 }: { percent: number; bars?: number }) {
  const filled = Math.round((percent / 100) * bars)
  return (
    <div className="flex h-10 w-full items-center justify-between gap-[3px]" role="img" aria-label={`${percent}% of goal reached`}>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-full w-[5px] shrink-0 rounded-full bg-primary transition-opacity duration-300',
            i >= filled && 'opacity-16',
          )}
        />
      ))}
    </div>
  )
}

export function Savings4({
  loading: loadingProp,
  className,
  showHeader = true,
  title = 'Savings',
  goals = DEFAULT_GOALS,
}: Savings4Props) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [goalMenuOpen, setGoalMenuOpen] = React.useState(false)
  const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState(goals[0]?.id ?? '')
  const [amounts, setAmounts] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(goals.map((g) => [g.id, g.amount])),
  )

  const goal = goals.find((g) => g.id === selectedId) ?? goals[0]
  const amount = goal ? (amounts[goal.id] ?? goal.amount) : 0
  const percent = goal ? Math.min(100, Math.round((amount / goal.target) * 100)) : 0

  function adjust(delta: number) {
    if (!goal) return
    setAmounts((prev) => ({
      ...prev,
      [goal.id]: Math.max(0, Math.min(goal.target, (prev[goal.id] ?? goal.amount) + delta)),
    }))
    setActionsMenuOpen(false)
  }

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-4 p-6', className)}>
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="size-[114px] shrink-0 rounded-full" />
        </div>
        <div className="flex w-full gap-4">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="size-12 shrink-0 rounded-full" />
        </div>
        <Separator />
        <Skeleton className="h-10 w-full rounded-full" />
      </Card>
    )
  }

  if (!goal) return null

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-4 p-6', className)}>
      {showHeader && (
      <div className="flex w-full items-center justify-between gap-2">
        <h3 className="font-mono text-sm font-normal uppercase tracking-[0.03em] text-muted-foreground">{title}</h3>
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
      )}

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="relative shrink-0">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={goalMenuOpen}
                onClick={() => setGoalMenuOpen((v) => !v)}
                className="flex items-center gap-0.5 rounded-lg text-base font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                For {goal.name}
                <ChevronDown className={cn('size-5 transition-transform', goalMenuOpen && 'rotate-180')} />
              </button>
              {goalMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Select savings goal"
                  className="absolute left-0 top-full z-10 mt-1.5 w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md"
                >
                  {goals.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={option.id === selectedId}
                      onClick={() => {
                        setSelectedId(option.id)
                        setGoalMenuOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                        option.id === selectedId ? 'text-primary' : 'text-popover-foreground',
                      )}
                    >
                      <span aria-hidden="true">{option.emoji}</span>
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[32px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground tabular-nums">
                ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-base font-medium text-muted-foreground">End: {goal.endDate}</p>
            </div>
          </div>
          <span
            className="flex size-[114px] shrink-0 items-center justify-center rounded-full bg-muted text-[57px]"
            aria-hidden="true"
          >
            {goal.emoji}
          </span>
        </div>

        <div className="flex w-full items-center gap-4">
          <div className="relative flex-1">
            <Button
              type="button"
              className="w-full gap-0 rounded-xl py-3 pl-3 pr-4 text-base font-semibold"
              aria-haspopup="menu"
              aria-expanded={actionsMenuOpen}
              onClick={() => setActionsMenuOpen((v) => !v)}
            >
              <Plus className="size-6" />
              Actions
            </Button>
            {actionsMenuOpen && (
              <div
                role="menu"
                aria-label="Goal actions"
                className="absolute left-0 top-full z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => adjust(CONTRIBUTION)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-popover-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Add ${CONTRIBUTION}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => adjust(-CONTRIBUTION)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-popover-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Withdraw ${CONTRIBUTION}
                </button>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded-xl py-3 text-base font-semibold text-foreground"
            aria-pressed={historyOpen}
            onClick={() => setHistoryOpen((v) => !v)}
          >
            History
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="shrink-0 rounded-full"
            aria-label={`More options for ${goal.name}`}
            onClick={refresh}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>

        {historyOpen && (
          <div className="flex w-full flex-col gap-2 rounded-xl bg-muted p-3">
            {goal.history.map((entry) => (
              <div key={entry.label + entry.date} className="flex w-full items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {entry.label} &bull; {entry.date}
                </span>
                <span className="font-medium text-foreground tabular-nums">+${entry.amount}</span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="size-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-base font-medium text-muted-foreground">Your Progress</p>
            </div>
            <p className="text-base font-semibold text-primary">{percent}%</p>
          </div>
          <ProgressBars percent={percent} />
        </div>
      </div>
    </Card>
  )
}

export default Savings4

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
