'use client'

import { Check, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface PricingPlan {
  id: string
  cadence: string
  price: string
  originalPrice?: string
  description: string
  ctaLabel: string
}

export interface PricingOptionsProps {
  className?: string
  loading?: boolean
  title?: string
  plans?: PricingPlan[]
  defaultPlanId?: string
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'yearly',
    cadence: 'Yearly',
    price: '$540/year',
    originalPrice: '$630',
    description: 'Pay yearly. Save $90',
    ctaLabel: 'Get Ultra for $540/y',
  },
  {
    id: 'monthly',
    cadence: 'Monthly',
    price: '$53/month',
    description: 'Pay monthly. Cancel anytime',
    ctaLabel: 'Get Ultra for $53/mo',
  },
]

export function PricingOptions({
  className,
  loading: forcedLoading,
  title = 'Pricing options',
  plans = defaultPlans,
  defaultPlanId = 'yearly',
}: PricingOptionsProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [selectedId, setSelectedId] = React.useState(defaultPlanId)
  const [confirmed, setConfirmed] = React.useState(false)

  const selectedPlan = plans.find((p) => p.id === selectedId) ?? plans[0]

  function handleConfirm() {
    setConfirmed(true)
    window.setTimeout(() => setConfirmed(false), 1800)
  }

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="flex w-full flex-col gap-4">
          {plans.map((p) => (
            <Skeleton key={p.id} className="h-[100px] w-full rounded-xl" />
          ))}
          <Skeleton className="h-[64px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
        <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh pricing" onClick={refresh}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex w-full flex-col gap-4" role="radiogroup" aria-label="Choose a plan">
        {plans.map((plan) => {
          const active = plan.id === selectedId
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelectedId(plan.id)}
              className={cn(
                'flex w-full items-center justify-between gap-6 rounded-xl px-6 py-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active ? 'bg-accent' : 'bg-muted hover:bg-muted/70',
              )}
            >
              <div className="flex flex-1 flex-col justify-between gap-1">
                <div className="flex items-center gap-2.5">
                  {plan.originalPrice && (
                    <span className="text-lg font-semibold text-muted-foreground line-through decoration-foreground/70">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-lg font-semibold text-foreground">{plan.price}</span>
                </div>
                <p className="text-base text-muted-foreground">{plan.description}</p>
              </div>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  active ? 'bg-primary text-primary-foreground' : 'border-2 border-primary',
                )}
              >
                {active && <Check className="size-4" />}
              </span>
            </button>
          )
        })}
      </div>

      <Button
        size="lg"
        className="w-full rounded-2xl py-6 text-lg font-bold"
        onClick={handleConfirm}
      >
        {confirmed ? 'Plan selected ✓' : selectedPlan.ctaLabel}
      </Button>
    </div>
  )
}

export default PricingOptions

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
