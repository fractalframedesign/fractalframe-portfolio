'use client'

import { Minus, MoreHorizontal, Plus, TriangleAlert } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SlippageProps {
  className?: string
  loading?: boolean
  title?: string
  description?: string
  defaultPercent?: number
  min?: number
  max?: number
  step?: number
  warningThreshold?: number
}

export function Slippage({
  className,
  loading: forcedLoading,
  title = 'Slippage',
  description = 'Slippage tolerance is the percent difference between the quoted price and execution price.',
  defaultPercent = 12,
  min = 0.1,
  max = 50,
  step = 0.5,
  warningThreshold = 5,
}: SlippageProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [percent, setPercent] = React.useState(defaultPercent)
  const [sending, setSending] = React.useState(false)

  const showWarning = percent > warningThreshold

  function adjustPercent(delta: number) {
    setPercent((p) => Math.round(Math.min(max, Math.max(min, p + delta)) * 10) / 10)
  }

  function handleSendAgain() {
    setSending(true)
    window.setTimeout(() => setSending(false), 900)
  }

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-12 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full items-center justify-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-16 w-40 rounded-full" />
            <Skeleton className="size-16 rounded-full" />
          </div>
          <div className="flex w-full gap-2">
            <Skeleton className="h-[68px] flex-1 rounded-2xl" />
            <Skeleton className="h-[68px] flex-1 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-12 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground',
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
          <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh slippage settings" onClick={refresh}>
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        <p className="w-full text-base leading-[1.5] tracking-[0.16px] text-muted-foreground">{description}</p>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Decrease slippage tolerance"
              onClick={() => adjustPercent(-step)}
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground outline-none transition-colors hover:bg-secondary/70 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Minus className="size-5" />
            </button>
            <div className="flex w-40 items-center justify-center rounded-full border-[1.5px] border-primary bg-muted px-6 py-4">
              <input
                type="number"
                inputMode="decimal"
                aria-label="Slippage tolerance percent"
                value={percent}
                min={min}
                max={max}
                step={step}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  if (!Number.isNaN(next)) setPercent(Math.min(max, Math.max(min, next)))
                }}
                className="w-full bg-transparent text-center text-lg font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-lg font-semibold text-foreground">%</span>
            </div>
            <button
              type="button"
              aria-label="Increase slippage tolerance"
              onClick={() => adjustPercent(step)}
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground outline-none transition-colors hover:bg-secondary/70 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Plus className="size-5" />
            </button>
          </div>
          {showWarning && (
            <div className="flex items-center justify-center gap-3" role="alert">
              <TriangleAlert className="size-5 shrink-0 text-primary" />
              <p className="text-sm font-medium tracking-[0.14px] text-primary">
                Prices may vary significantly at high percents
              </p>
            </div>
          )}
        </div>

        <div className="flex w-full items-center gap-2">
          <Button variant="secondary" size="lg" className="flex-1 rounded-2xl py-6 text-lg font-bold text-muted-foreground">
            Back Home
          </Button>
          <Button size="lg" className="flex-1 rounded-2xl py-6 text-lg font-bold" onClick={handleSendAgain} disabled={sending}>
            {sending ? 'Sending…' : 'Send Again'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Slippage

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
