'use client'

import { Info, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { Switch } from '@/components/project-demos/fintech-components/ui/switch'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface BreakdownSlice {
  id: string
  label: string
  amount: number
  color: string
  info: string
}

export interface BreakdownProps {
  className?: string
  loading?: boolean
  title?: string
  slices?: BreakdownSlice[]
  netInvestments?: number
  totalGainLoss?: number
}

const defaultSlices: BreakdownSlice[] = [
  { id: 'stocks', label: 'Stocks', amount: 30, color: 'var(--color-chart-1)', info: 'Shares of publicly traded companies held in your portfolio.' },
  { id: 'bonds', label: 'Bonds', amount: 20, color: 'var(--color-chart-4)', info: 'Fixed-income securities that pay interest over time.' },
]

function DonutSlice({ slice, total }: { slice: BreakdownSlice; total: number }) {
  const data = [
    { name: slice.label, value: slice.amount },
    { name: 'rest', value: Math.max(total - slice.amount, 0) },
  ]
  return (
    <div className="relative size-[92px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={34} outerRadius={44} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
            <Cell fill={slice.color} />
            <Cell fill="var(--color-muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function InfoRow({
  label,
  value,
  info,
  emphasized,
}: {
  label: string
  value: string
  info: string
  emphasized?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1">
          <span className={cn('text-sm font-medium tracking-[0.14px] text-muted-foreground', emphasized && 'text-base font-semibold text-foreground')}>
            {label}
          </span>
          <button
            type="button"
            aria-label={`About ${label}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Info className="size-4" />
          </button>
        </div>
        <span
          className={cn(
            'text-base font-medium tracking-[0.16px] text-foreground',
            emphasized && 'text-base font-semibold text-success',
          )}
        >
          {value}
        </span>
      </div>
      {open && <p className="w-full text-xs leading-[1.5] text-muted-foreground">{info}</p>}
    </div>
  )
}

export function Breakdown({
  className,
  loading: forcedLoading,
  title = 'Breakdown',
  slices = defaultSlices,
  netInvestments = 50,
  totalGainLoss = 5,
}: BreakdownProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [showPercent, setShowPercent] = React.useState(false)

  const total = slices.reduce((sum, s) => sum + s.amount, 0)
  const totalValue = netInvestments + totalGainLoss

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="flex w-full items-center justify-between px-6">
          {slices.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-3">
              <Skeleton className="size-[92px] rounded-full" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
        <div className="h-px w-full bg-border" />
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            %
            <Switch checked={showPercent} onCheckedChange={setShowPercent} aria-label="Show allocation as percentage" />
          </label>
          <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh breakdown" onClick={refresh}>
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex w-full items-center justify-between px-6">
        {slices.map((slice) => (
          <div key={slice.id} className="flex flex-col items-center gap-3">
            <DonutSlice slice={slice} total={total} />
            <div className="flex flex-col items-center gap-1">
              <p className="text-2xl font-semibold tracking-[0.24px] text-foreground">
                {showPercent ? `${Math.round((slice.amount / total) * 100)}%` : `$${slice.amount}`}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium tracking-[0.14px] text-muted-foreground">{slice.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px w-full border-t border-dashed border-border" />

      <div className="flex w-full flex-col gap-4">
        <InfoRow label="Net investments (All time)" value={`$${netInvestments.toFixed(2)}`} info="The total amount you've deposited into this portfolio, excluding gains or losses." />
        <InfoRow label="Total gail/loss" value={`$${totalGainLoss.toFixed(2)}`} info="The change in your portfolio's value since your first investment." />
        <InfoRow
          label="Total combined account value"
          value={`$${totalValue.toFixed(2)}`}
          info="Net investments plus total gain or loss — your current account balance."
          emphasized
        />
      </div>
    </div>
  )
}

export default Breakdown

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
