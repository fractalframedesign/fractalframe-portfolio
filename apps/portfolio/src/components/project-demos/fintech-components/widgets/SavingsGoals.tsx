'use client'

import { Check, RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { Slider } from '@/components/project-demos/fintech-components/ui/slider'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SavingsGoalsProps {
  className?: string
  loading?: boolean
  showHeader?: boolean
  showDescription?: boolean
  title?: string
  description?: string
  min?: number
  max?: number
  step?: number
  defaultAmount?: number
}

// Fixed bar heights (px) baked in to match the Figma histogram silhouette —
// purely decorative, driven by the slider position for the "active" bar.
const BAR_HEIGHTS = [30, 30, 48, 30, 30, 30, 30, 48, 30, 30, 30, 30, 61, 30, 30, 30, 30, 48, 30, 30, 30, 30]

export function SavingsGoals({
  className,
  loading: forcedLoading,
  showHeader = true,
  showDescription = true,
  title = 'Savings Goals',
  description = 'Effortlessly track and adjust your savings goals.',
  min = 100,
  max = 700,
  step = 10,
  defaultAmount = 450,
}: SavingsGoalsProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [amount, setAmount] = React.useState(defaultAmount)
  const [saved, setSaved] = React.useState(false)
  const savedTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(savedTimeout.current), [])

  const percent = (amount - min) / (max - min)
  const activeBarIndex = Math.round(percent * (BAR_HEIGHTS.length - 1))
  const marks = [
    min + (max - min) * 0.29,
    min + (max - min) * 0.43,
    min + (max - min) * 0.71,
    min + (max - min) * 0.86,
  ]

  function handleSave() {
    setSaved(true)
    clearTimeout(savedTimeout.current)
    savedTimeout.current = setTimeout(() => setSaved(false), 1800)
  }

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-9 rounded-full" />
            </div>
            {showDescription && <Skeleton className="h-4 w-full max-w-sm" />}
          </div>
        )}
        <div className="flex w-full flex-col items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      {showHeader && (
        <div className="flex w-full flex-col gap-3">
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
          {showDescription && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}

      <div className="flex w-full flex-col items-center justify-center gap-4">
        <div className="flex w-full flex-col items-center gap-1 text-center">
          <p className="font-medium text-muted-foreground text-sm">Amount</p>
          <p className="font-semibold text-4xl text-foreground tabular-nums">
            ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex w-full justify-between text-muted-foreground text-xs">
            {marks.map((m) => (
              <span key={m}>${Math.round(m / 10) * 10}</span>
            ))}
          </div>
          <div className="flex h-[60px] w-full items-center justify-between gap-[3px]" aria-hidden="true">
            {BAR_HEIGHTS.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h * 0.75}px` }}
                className={cn(
                  'w-[3px] shrink-0 rounded-full bg-primary/40 transition-all duration-150',
                  i === activeBarIndex && 'bg-primary opacity-100',
                )}
              />
            ))}
          </div>
          <Slider
            value={amount}
            min={min}
            max={max}
            step={step}
            onValueChange={setAmount}
            aria-label="Savings goal amount"
            className="mt-1"
          />
        </div>
      </div>

      <Button
        variant="default"
        size="lg"
        className="w-full rounded-2xl py-6 text-lg"
        onClick={handleSave}
      >
        {saved ? (
          <>
            <Check className="size-5" /> Saved
          </>
        ) : (
          'Save'
        )}
      </Button>
    </div>
  )
}

export default SavingsGoals

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
