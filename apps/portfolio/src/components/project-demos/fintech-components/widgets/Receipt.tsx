'use client'

import { Check, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface ReceiptTransaction {
  id: string
  recipientName: string
  amount: number
  noCommission: boolean
  transactionId: string
  status: 'Success' | 'Pending' | 'Failed'
  senderName: string
  date: string
  totalPayment: number
}

export interface ReceiptProps {
  className?: string
  loading?: boolean
  title?: string
  transactions?: ReceiptTransaction[]
}

const DEFAULT_TRANSACTIONS: ReceiptTransaction[] = [
  {
    id: 't1',
    recipientName: 'Aleksander Dmitrievich V.',
    amount: 100,
    noCommission: true,
    transactionId: '124562846294',
    status: 'Success',
    senderName: 'Anastasia Vlasenko',
    date: '28 May 2024 at 09:00 am',
    totalPayment: 2545,
  },
  {
    id: 't2',
    recipientName: 'Marta Costa Silva',
    amount: 245.5,
    noCommission: false,
    transactionId: '987654321012',
    status: 'Success',
    senderName: 'James Okafor',
    date: '2 Jun 2024 at 3:20 pm',
    totalPayment: 1820.5,
  },
  {
    id: 't3',
    recipientName: 'Wei Zhang',
    amount: 62,
    noCommission: true,
    transactionId: '551100994477',
    status: 'Success',
    senderName: 'Priya Nair',
    date: '18 Jul 2024 at 4:05 pm',
    totalPayment: 940,
  },
]

const amountFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const STATUS_CLASS: Record<ReceiptTransaction['status'], string> = {
  Success: 'text-success',
  Pending: 'text-warning',
  Failed: 'text-destructive',
}

function ReceiptSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col items-center gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <Skeleton className="size-14 rounded-full" />
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-3.5 w-28" />
      </div>
      <div className="w-full rounded-xl bg-muted p-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between py-2.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        ))}
        <div className="my-1 border-t border-dashed border-border" />
        <div className="flex justify-between py-2.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
    </div>
  )
}

export function Receipt({
  className,
  loading: loadingProp,
  title = 'Receipt',
  transactions = DEFAULT_TRANSACTIONS,
}: ReceiptProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [txIndex, setTxIndex] = React.useState(0)

  if (loading) return <ReceiptSkeleton className={className} />

  const tx = transactions[txIndex % transactions.length]

  function handleRefresh() {
    setTxIndex((i) => (i + 1) % transactions.length)
    refresh()
  }

  return (
    <div className={cn('flex max-w-[480px] flex-col items-center gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Next receipt"
          onClick={handleRefresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-full border-[12px] border-success/10 bg-success text-success-foreground">
          <Check className="size-6" strokeWidth={3} />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-base font-semibold">{tx.recipientName}</p>
          <p className="text-[32px] font-bold leading-tight tabular-nums tracking-tight">
            {amountFormatter.format(tx.amount)}
          </p>
          <p className="text-sm text-muted-foreground">
            {tx.noCommission ? 'No commission' : 'Commission applied'}
          </p>
        </div>
      </div>

      <div className="w-full rounded-xl bg-muted/60 px-4">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">Transaction ID</span>
          <span className="font-mono text-sm font-medium tabular-nums">{tx.transactionId}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className={cn('text-sm font-semibold', STATUS_CLASS[tx.status])}>{tx.status}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">Sender Name</span>
          <span className="text-sm font-medium">{tx.senderName}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="text-sm font-medium">{tx.date}</span>
        </div>
        <div className="border-t border-dashed border-border" />
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">Total Payment</span>
          <span className="text-sm font-semibold tabular-nums">{amountFormatter.format(tx.totalPayment)}</span>
        </div>
      </div>
    </div>
  )
}

export default Receipt

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
