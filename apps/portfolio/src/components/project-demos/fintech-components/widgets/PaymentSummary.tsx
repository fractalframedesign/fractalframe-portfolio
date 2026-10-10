'use client'

import { Check, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const avatar1 = '/images/projects/fintech-components/quick-transfer/avatar-1.png'
const avatar2 = '/images/projects/fintech-components/quick-transfer/avatar-2.png'
const avatar3 = '/images/projects/fintech-components/quick-transfer/avatar-3.png'

export interface PaymentSummaryTransfer {
  recipientName: string
  recipientAvatar: string
  datetime: string
  amount: number
  cardBrand: 'Visa' | 'Mastercard'
  maskedNumber: string
  cardExpiry: string
}

export interface PaymentSummaryProps {
  className?: string
  loading?: boolean
  title?: string
  transfers?: PaymentSummaryTransfer[]
}

const DEFAULT_TRANSFERS: PaymentSummaryTransfer[] = [
  {
    recipientName: 'Mickey Chama Jr',
    recipientAvatar: avatar1,
    datetime: 'Aug 30 at 2:09 am',
    amount: 450,
    cardBrand: 'Visa',
    maskedNumber: '4266',
    cardExpiry: '2027',
  },
  {
    recipientName: 'Maya Patel',
    recipientAvatar: avatar2,
    datetime: 'Sep 4 at 11:30 am',
    amount: 120,
    cardBrand: 'Mastercard',
    maskedNumber: '8812',
    cardExpiry: '2026',
  },
  {
    recipientName: 'Kenji Yamamoto',
    recipientAvatar: avatar3,
    datetime: 'Sep 12 at 6:45 pm',
    amount: 290,
    cardBrand: 'Visa',
    maskedNumber: '3371',
    cardExpiry: '2028',
  },
]

function MastercardIcon({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center', className)} aria-hidden="true">
      <div className="size-7 rounded-full bg-red-500 opacity-90" />
      <div className="-ml-3.5 size-7 rounded-full bg-amber-400 opacity-90 mix-blend-multiply dark:mix-blend-screen" />
    </div>
  )
}

function VisaIcon({ className }: { className?: string }) {
  return (
    <div className={cn('flex size-8 items-center justify-center rounded-md bg-blue-600', className)} aria-hidden="true">
      <span className="font-bold italic text-white text-xs tracking-widest">VISA</span>
    </div>
  )
}

function PaymentSummarySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-3.5 w-32" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="ml-auto h-3.5 w-28" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
        <Skeleton className="h-3.5 w-28" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-12" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export function PaymentSummary({
  className,
  loading: loadingProp,
  title = 'Summary',
  transfers = DEFAULT_TRANSFERS,
}: PaymentSummaryProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [txIndex, setTxIndex] = React.useState(0)

  if (loading) return <PaymentSummarySkeleton className={className} />

  const tx = transfers[txIndex % transfers.length]

  function handleSendAgain() {
    setTxIndex((i) => (i + 1) % transfers.length)
    refresh()
  }

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh summary"
          onClick={refresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      {/* Payment status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="size-3.5" strokeWidth={3} />
          </div>
          <span className="text-base font-semibold">Successful</span>
        </div>
        <span className="tabular-nums text-base font-semibold text-muted-foreground">
          -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(tx.amount)}
        </span>
      </div>

      <div className="border-t border-dashed border-border" />

      {/* Transfer to */}
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Transfer money to</p>
        <div className="flex items-center gap-3">
          <img
            src={tx.recipientAvatar}
            alt={tx.recipientName}
            className="size-10 rounded-full object-cover ring-1 ring-border"
          />
          <span className="flex-1 text-sm font-semibold">{tx.recipientName}</span>
          <span className="text-xs text-muted-foreground">{tx.datetime}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="flex flex-col gap-3 rounded-xl bg-muted/60 px-4 py-4">
        <p className="text-xs text-muted-foreground">Payment method</p>
        <div className="flex items-center gap-3">
          {tx.cardBrand === 'Mastercard' ? (
            <MastercardIcon />
          ) : (
            <VisaIcon />
          )}
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold">
              {tx.cardBrand} · **** {tx.maskedNumber}
            </span>
            <span className="text-xs text-muted-foreground">Ending in {tx.cardExpiry}</span>
          </div>
          <span className="tabular-nums text-sm font-semibold text-muted-foreground">
            -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(tx.amount)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="h-12 flex-1 rounded-xl text-sm font-semibold active:scale-[0.96]"
          onClick={refresh}
        >
          Back Home
        </Button>
        <Button
          size="lg"
          className="h-12 flex-1 rounded-xl text-sm font-semibold active:scale-[0.96]"
          onClick={handleSendAgain}
        >
          Send Again
        </Button>
      </div>
    </div>
  )
}

export default PaymentSummary

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
 *
 *   --success: oklch(0.6 0.135 155);
 *   --success-foreground: oklch(0.99 0.005 260);
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
 *
 *   --success: oklch(0.68 0.14 155);
 *   --success-foreground: oklch(0.15 0.03 155);
 * }
 */
