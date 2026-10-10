'use client'

import { Minus, MoreHorizontal, Plus } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface CreditPaymentPlannerProps {
  className?: string
  loading?: boolean
  showHeader?: boolean
  title?: string
  totalInstallments?: number
  paidInstallments?: number
  monthlyAmount?: string
  dueDate?: string
  nextPaymentDays?: number
  totalBalance?: string
  interestRate?: string
  creditLimit?: string
}

const TICK_COUNT = 40
const AXIS_MARKS = [0, 8, 16, 24, 32]

function polarPoint(angleDeg: number, radius: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  // Rounded so server and client render identical SVG attributes (avoids hydration mismatches)
  const round = (value: number) => Math.round(value * 1000) / 1000
  return { x: round(cx + radius * Math.cos(rad)), y: round(cy + radius * Math.sin(rad)) }
}

export function CreditPaymentPlanner({
  className,
  loading: forcedLoading,
  showHeader = true,
  title = 'Credit Payment Planner',
  totalInstallments = 32,
  paidInstallments: paidInstallmentsProp = 28,
  monthlyAmount = '$1,400',
  dueDate = '12.12.2026',
  nextPaymentDays = 8,
  totalBalance = '$5,495',
  interestRate = '12%',
  creditLimit = '$4,000',
}: CreditPaymentPlannerProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [paid, setPaid] = React.useState(paidInstallmentsProp)
  const [prevPaidProp, setPrevPaidProp] = React.useState(paidInstallmentsProp)

  // Re-sync when the prop changes (adjusting state during render, not in an effect)
  if (prevPaidProp !== paidInstallmentsProp) {
    setPrevPaidProp(paidInstallmentsProp)
    setPaid(paidInstallmentsProp)
  }

  const cx = 175
  const cy = 188
  const rOuter = 172
  const rInner = 150
  const rLabel = 192

  const progress = totalInstallments > 0 ? paid / totalInstallments : 0
  const boundaryAngle = -90 + 180 * progress
  const boundaryPoint = polarPoint(boundaryAngle, (rOuter + rInner) / 2, cx, cy)

  function adjust(delta: number) {
    setPaid((p) => Math.min(totalInstallments, Math.max(0, p + delta)))
  }

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-0 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full items-center justify-between pb-6">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        )}
        <div className="flex w-full flex-col items-center gap-2 pb-6">
          <Skeleton className="h-[200px] w-full max-w-[388px] rounded-full" />
        </div>
        <Skeleton className="h-8 w-full rounded-full" />
        <div className="flex w-full items-center justify-between pt-6">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-16" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-0 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      {showHeader && (
        <div className="flex w-full items-center justify-between pb-6">
          <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
          <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh payment planner" onClick={refresh}>
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      )}

      <div className="relative h-[200px] w-full">
        <svg viewBox="0 0 350 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {Array.from({ length: TICK_COUNT }).map((_, i) => {
            const angle = -90 + (180 / (TICK_COUNT - 1)) * i
            const p1 = polarPoint(angle, rInner, cx, cy)
            const p2 = polarPoint(angle, rOuter, cx, cy)
            const isPaid = i / (TICK_COUNT - 1) <= progress
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                strokeWidth={4}
                strokeLinecap="round"
                stroke={isPaid ? `color-mix(in oklch, var(--color-chart-2) ${100 - (i / TICK_COUNT) * 60}%, var(--color-primary))` : 'var(--color-muted)'}
              />
            )
          })}
          {AXIS_MARKS.map((mark) => {
            const angle = -90 + 180 * (mark / totalInstallments)
            const p = polarPoint(angle, rLabel, cx, cy)
            return (
              <text
                key={mark}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[12px] font-medium"
              >
                {mark}
              </text>
            )
          })}
        </svg>

        <div
          className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: `${(boundaryPoint.x / 350) * 100}%`, top: `${(boundaryPoint.y / 200) * 100}%` }}
        >
          <span className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-semibold text-primary shadow-lg backdrop-blur-sm">
            {paid}/{totalInstallments}
          </span>
        </div>

        <div className="absolute top-[119px] left-1/2 flex w-[220px] -translate-x-1/2 flex-col items-center text-center">
          <p className="text-[40px] leading-none font-semibold tracking-[-0.4px] text-foreground">{monthlyAmount}</p>
          <p className="text-xs font-medium tracking-[0.12px] text-muted-foreground">to be deposited by {dueDate}</p>
        </div>
      </div>

      <div className="my-6 flex w-full items-center justify-between">
        <div className="h-px flex-1 bg-border" />
        <div className="shrink-0 rounded-full bg-accent px-3 py-1">
          <p className="text-sm font-medium text-primary">
            Next payment in {nextPaymentDays} day{nextPaymentDays === 1 ? '' : 's'}
          </p>
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-2xl font-semibold tracking-[0.24px] text-foreground">{totalBalance}</p>
          <p className="text-sm font-medium tracking-[0.14px] text-muted-foreground">Total Balance</p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-2xl font-semibold tracking-[0.24px] text-foreground">{interestRate}</p>
          <p className="text-sm font-medium tracking-[0.14px] text-muted-foreground">Interest Rate</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <p className="text-2xl font-semibold tracking-[0.24px] text-foreground">{creditLimit}</p>
          <p className="text-sm font-medium tracking-[0.14px] text-muted-foreground">Credit Limit</p>
        </div>
      </div>

      <div className="mt-4 flex w-full items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          aria-label="Log one fewer paid installment"
          onClick={() => adjust(-1)}
          disabled={paid <= 0}
        >
          <Minus className="size-3.5" />
        </Button>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{paid}</span> of {totalInstallments} installments paid
        </p>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          aria-label="Log one more paid installment"
          onClick={() => adjust(1)}
          disabled={paid >= totalInstallments}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default CreditPaymentPlanner

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
