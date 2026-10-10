'use client'

import { ArrowDownToLine, ArrowUp, ArrowUpFromLine, ArrowUpRight, Minus, Plus, RefreshCw, Repeat } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/project-demos/fintech-components/ui/badge'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface Balance2Props {
  className?: string
  loading?: boolean
  /** Total balance amount, already formatted */
  amount?: string
  /** Label under the amount */
  amountLabel?: string
  /** Interest / change percentage shown in the pill badge */
  interestPercent?: string
  /** Asset name referenced in the description copy */
  assetName?: string
  /** Description copy explaining the asset */
  description?: string
}

type ActionKey = 'add' | 'sell' | 'convert' | 'send' | 'receive'

export function Balance2({
  className,
  loading: forcedLoading,
  amount = '$14,300.00',
  amountLabel = 'Total amount saved',
  interestPercent = '2.03%',
  assetName = 'USDC',
  description = 'USDC (digital US dollar) is a type of cryptocurrency that is referred to as a stablecoin. Cash out one digital USD for exactly one US dollar at any time.',
}: Balance2Props) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [expanded, setExpanded] = React.useState(false)
  const [selectedAction, setSelectedAction] = React.useState<ActionKey | null>(null)

  const actions: { key: ActionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'add', label: `Add ${assetName}`, icon: Plus },
    { key: 'sell', label: 'Sell', icon: Minus },
    { key: 'convert', label: 'Convert', icon: Repeat },
    { key: 'send', label: 'Send', icon: ArrowUpFromLine },
    { key: 'receive', label: 'Receive', icon: ArrowDownToLine },
  ]

  const actionMessages: Record<ActionKey, string> = {
    add: `Opening the buy flow for ${assetName}…`,
    sell: `Preparing to sell your ${assetName} balance…`,
    convert: `Choose an asset to convert ${assetName} into.`,
    send: `Enter a recipient to send ${assetName}.`,
    receive: `Share your address to receive ${assetName}.`,
  }

  if (loading) {
    return (
      <div
        className={cn(
 'flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6',
          className,
        )}
      >
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex w-full items-center justify-between">
            {actions.map((a) => (
              <div key={a.key} className="flex flex-col items-center gap-3">
                <Skeleton className="size-[58px] rounded-full" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground',
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">Balance</p>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            aria-label="Refresh balance"
            onClick={refresh}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[32px] font-semibold leading-[1.3] tracking-[-0.32px] text-foreground">{amount}</p>
            <p className="text-sm font-medium tracking-[0.14px] text-muted-foreground">{amountLabel}</p>
          </div>
          <Badge className="gap-1 bg-secondary px-2 py-1 text-[18px] font-medium text-primary">
            <ArrowUp className="size-4" />
            {interestPercent}
          </Badge>
        </div>
      </div>

      <div className="flex w-full flex-col gap-8">
        <div className="flex items-center justify-center">
          <p className="text-[16px] leading-[1.5] tracking-[0.16px] text-foreground">
            {expanded ? description : `${description.slice(0, 92)}…`}{' '}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="font-semibold text-primary underline-offset-2 outline-none hover:underline focus-visible:underline"
            >
              {expanded ? 'Show less' : 'Learn more'}
            </button>
          </p>
        </div>

        <div className="flex w-full items-center justify-between">
          {actions.map(({ key, label, icon: Icon }) => {
            const active = selectedAction === key
            return (
              <div key={key} className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={active}
                  onClick={() => setSelectedAction(key)}
                  className={cn(
                    'flex size-[58px] items-center justify-center rounded-full bg-foreground text-background outline-none transition-transform duration-150 hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    active && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                  )}
                >
                  <Icon className="size-6" />
                </button>
                <p className="text-sm font-medium tracking-[0.14px] text-foreground">{label}</p>
              </div>
            )
          })}
        </div>

        {selectedAction && (
          <p className="flex w-full items-center gap-1.5 text-sm text-muted-foreground" role="status">
            <ArrowUpRight className="size-3.5 shrink-0 text-primary" />
            {actionMessages[selectedAction]}
          </p>
        )}
      </div>
    </div>
  )
}

export default Balance2

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
