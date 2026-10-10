'use client'

import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const AMOUNT_CHIPS = [0, 10, 20, 50] as const
type AmountChip = (typeof AMOUNT_CHIPS)[number] | 'other'

export interface CheckoutProps {
  className?: string
  loading?: boolean
  title?: string
  planLabel?: string
  cardLabel?: string
  baseCost?: number
}

function CheckoutSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex flex-col gap-px rounded-xl overflow-hidden bg-muted">
        <div className="flex justify-between bg-card px-4 py-3">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3.5 w-52" />
        </div>
        <div className="flex justify-between bg-card px-4 py-3">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3.5 w-36" />
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-3.5 w-8" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-12 rounded-full" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-8" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

export function Checkout({
  className,
  loading: loadingProp,
  title = 'Checkout',
  planLabel = 'Premium (1 month no-fee) · No-fee',
  cardLabel = 'Virtual · ****8196',
  baseCost = 0,
}: CheckoutProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [selected, setSelected] = React.useState<AmountChip>(10)

  if (loading) return <CheckoutSkeleton className={className} />

  const addAmount = selected === 'other' ? 0 : selected
  const totalAmount = baseCost + addAmount

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh checkout"
          onClick={refresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      {/* Plan + Card details */}
      <div className="overflow-hidden rounded-xl bg-muted/60">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Plan</span>
          <span className="text-sm font-medium">{planLabel}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Card</span>
          <span className="text-sm font-medium">{cardLabel}</span>
        </div>
      </div>

      {/* Add money section */}
      <div className="flex flex-col gap-3 rounded-xl bg-muted/60 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Add money to spend later</span>
          <span className="text-sm font-semibold tabular-nums">
            {selected === 'other' ? '$0' : `$${selected}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AMOUNT_CHIPS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setSelected(amt)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]',
                selected === amt
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              ${amt}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelected('other')}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]',
              selected === 'other'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            Other
          </button>
        </div>
      </div>

      {/* Total + Payment method */}
      <div className="flex flex-col gap-3 rounded-xl bg-muted/60 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total amount</span>
          <span className="text-sm font-semibold tabular-nums">${totalAmount}</span>
        </div>
        <div className="flex items-center justify-between">
          {/* Apple Pay mark — single inline SVG, no external dependency */}
          <span className="flex items-center gap-1.5 text-base font-semibold">
            <svg viewBox="0 0 22 16" width="22" height="16" aria-hidden="true" fill="currentColor">
              <path d="M4.25 3.5C4.94 2.68 5.39 1.59 5.25.5 4.29.56 3.14 1.15 2.42 1.99 1.76 2.75 1.22 3.87 1.38 4.94c1.05.08 2.12-.5 2.87-1.44z" />
              <path d="M5.24 5c-1.59-.09-2.95.9-3.71.9-.77 0-1.94-.86-3.2-.84C-3.28 5.08-4.6 5.98-5.28 7.33c-1.38 2.37-.36 5.88.98 7.81.66.96 1.44 2.03 2.48 1.99 1-.04 1.38-.65 2.59-.65 1.2 0 1.55.65 2.6.63 1.07-.02 1.74-1 2.4-1.96.75-1.1 1.06-2.17 1.08-2.23-.02-.01-2.08-.8-2.1-3.16-.02-1.98 1.62-2.93 1.69-2.97C5.53 5.93 4.1 5.02 4.1 5.02L5.24 5z" transform="translate(8.5 .5) scale(.75)" />
            </svg>
            Pay
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs"
            onClick={refresh}
          >
            Change
          </Button>
        </div>
      </div>

      <Button
        size="lg"
        className="h-12 w-full rounded-xl text-base font-semibold active:scale-[0.96]"
        onClick={refresh}
      >
        Pay {totalAmount} USD
      </Button>
    </div>
  )
}

export default Checkout

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
 *   --primary: oklch(0.5 0.19 264);
 *   --primary-foreground: oklch(0.99 0.005 260);
 *
 *   --secondary: oklch(0.955 0.008 260);
 *   --secondary-foreground: oklch(0.28 0.02 260);
 *
 *   --muted: oklch(0.955 0.008 260);
 *   --muted-foreground: oklch(0.5 0.02 260);
 *
 *   --border: oklch(0.9 0.008 260);
 *   --ring: oklch(0.5 0.19 264 / 45%);
 * }
 *
 * .dark {
 *   --background: oklch(0.17 0.014 260);
 *   --foreground: oklch(0.95 0.006 260);
 *
 *   --card: oklch(0.21 0.015 260);
 *   --card-foreground: oklch(0.95 0.006 260);
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
 *   --border: oklch(1 0 0 / 10%);
 *   --ring: oklch(0.68 0.16 264 / 45%);
 * }
 */
