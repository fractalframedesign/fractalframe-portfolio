'use client'

import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ArrowUpRight,
  ChevronDown,
  MoreHorizontal,
  Send,
  Shield,
  Split,
  Wallet,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Separator } from '@/components/project-demos/fintech-components/ui/separator'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface CardFeature {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

export interface CardFeaturesProps {
  className?: string
  loading?: boolean
  title?: string
  amount?: number
  amountLabel?: string
  changePercent?: number
}

const PRIMARY_FEATURES: CardFeature[] = [
  { id: 'deposit', label: 'Deposit', icon: ArrowDownToLine, description: 'Add money to this card instantly.' },
  { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine, description: 'Move funds out to a linked account.' },
  { id: 'exchange', label: 'Exchange', icon: ArrowLeftRight, description: 'Convert between currencies at live rates.' },
  { id: 'send', label: 'Send', icon: Send, description: 'Transfer to another person in seconds.' },
]

const MORE_FEATURES: CardFeature[] = [
  { id: 'split', label: 'Split bill', icon: Split, description: 'Divide a payment with friends.' },
  { id: 'freeze', label: 'Freeze card', icon: Shield, description: 'Temporarily lock this card.' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, description: 'Manage linked digital wallets.' },
]

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function CardFeaturesSkeleton({ className }: { className?: string }) {
  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-6 rounded-xl bg-muted p-8">
        <div className="flex w-full items-center justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="size-[72px] rounded-full" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-32 self-center" />
      </div>
    </div>
  )
}

export function CardFeatures({
  className,
  loading: loadingProp,
  title = 'Card Features',
  amount = 14300,
  amountLabel = 'Total amount saved',
  changePercent = 2.03,
}: CardFeaturesProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showMore, setShowMore] = React.useState(false)

  if (loading) return <CardFeaturesSkeleton className={className} />

  const allFeatures = [...PRIMARY_FEATURES, ...(showMore ? MORE_FEATURES : [])]
  const selected = allFeatures.find((f) => f.id === selectedId) ?? null

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Refresh card features"
            onClick={refresh}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-[32px] font-semibold leading-tight tracking-tight">
              {currencyFormatter.format(amount)}
            </p>
            <p className="text-sm text-muted-foreground">{amountLabel}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-lg font-medium text-primary">
            <ArrowUpRight className="size-5" />
            {changePercent}%
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 rounded-xl bg-muted p-8">
        <div className="flex w-full flex-wrap items-start justify-between gap-4">
          {allFeatures.map((feature) => {
            const Icon = feature.icon
            const isSelected = selectedId === feature.id
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : feature.id)}
                aria-pressed={isSelected}
                className="flex flex-col items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              >
                <span
                  className={cn(
                    'flex size-[72px] items-center justify-center rounded-full bg-foreground text-background transition-transform',
                    isSelected ? 'scale-105 ring-2 ring-ring ring-offset-2 ring-offset-muted' : 'hover:scale-105',
                  )}
                >
                  <Icon className="size-8" />
                </span>
                <span className="text-sm font-medium">{feature.label}</span>
              </button>
            )
          })}
        </div>

        {selected && (
          <p className="rounded-lg bg-card px-3 py-2 text-center text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{selected.label}:</span> {selected.description}
          </p>
        )}

        <Separator />

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className="flex items-center justify-center gap-1 self-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {showMore ? 'Less features' : 'More features'}
          <ChevronDown className={cn('size-5 transition-transform', showMore && 'rotate-180')} />
        </button>
      </div>
    </div>
  )
}

export default CardFeatures

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
