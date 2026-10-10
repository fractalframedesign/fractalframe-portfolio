'use client'

import { Check, ChevronRight, Heart, HelpCircle, MoreHorizontal, Percent, Receipt } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export type OnlinePaymentConfirmation2Tab = 'orders' | 'favorites' | 'promos' | 'help'

export interface PendingPayment {
  id: string
  label: string
  date: string
  amount: number
}

export interface OnlinePaymentConfirmation2Props {
  className?: string
  loading?: boolean
  title?: string
  totalOwed?: number
  pendingPayments?: PendingPayment[]
}

const TABS: { id: OnlinePaymentConfirmation2Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'orders', label: 'Orders', icon: Receipt },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'promos', label: 'Promos', icon: Percent },
  { id: 'help', label: 'Help', icon: HelpCircle },
]

const TAB_PANELS: Record<Exclude<OnlinePaymentConfirmation2Tab, 'orders'>, { title: string; body: string }> = {
  favorites: { title: 'Favorites', body: 'Merchants and contacts you star will show up here for quick payments.' },
  promos: { title: 'Promos', body: 'No active promo codes right now — check back after your next payment.' },
  help: { title: 'Help', body: 'Contact support or browse FAQs about pending and confirmed payments.' },
}

const DEFAULT_PENDING: PendingPayment[] = [{ id: 'p1', label: 'Confirm 1 incoming payment', date: 'May 2 at 12:45 pm', amount: 53.16 }]

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function OnlinePaymentConfirmation2Skeleton({ className }: { className?: string }) {
  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex w-full items-center gap-10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      <div className="flex w-full flex-col gap-4 rounded-xl bg-muted p-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3.5 w-36" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function OnlinePaymentConfirmation2({
  className,
  loading: loadingProp,
  title = 'Online Payment Confirmation',
  totalOwed = 53.16,
  pendingPayments = DEFAULT_PENDING,
}: OnlinePaymentConfirmation2Props) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [activeTab, setActiveTab] = React.useState<OnlinePaymentConfirmation2Tab>('orders')
  const [pending, setPending] = React.useState(pendingPayments)
  const [expanded, setExpanded] = React.useState(true)

  if (loading) return <OnlinePaymentConfirmation2Skeleton className={className} />

  function allowPayment(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id))
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh online payment confirmation"
          onClick={refresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex w-full items-center gap-10" role="tablist" aria-label="Sections">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            >
              <span
                className={cn(
                  'flex size-12 items-center justify-center rounded-full transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background',
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab !== 'orders' ? (
        <div className="flex w-full flex-col gap-2 rounded-xl bg-muted p-6">
          <p className="text-lg font-semibold">{TAB_PANELS[activeTab].title}</p>
          <p className="text-sm text-muted-foreground">{TAB_PANELS[activeTab].body}</p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-4 rounded-xl bg-muted p-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-2xl font-semibold tracking-wide">Orders</p>
              <p className="text-sm text-muted-foreground">
                Total amount owed <span className="font-semibold text-foreground">{currencyFormatter.format(totalOwed)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="flex items-center gap-2 rounded-full bg-primary/10 py-1 pl-3 pr-1 text-sm font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pending.length} active
              <ChevronRight className={cn('size-5 transition-transform', expanded && 'rotate-90')} />
            </button>
          </div>

          {expanded && (
            <>
              <div className="h-px w-full border-t border-dashed border-border" />
              {pending.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="size-4 text-success" />
                  All caught up — no pending confirmations.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {pending.map((item) => (
                    <div key={item.id} className="flex w-full items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <Button className="h-12 shrink-0 rounded-xl px-6 text-base font-semibold" onClick={() => allowPayment(item.id)}>
                        Allow payment
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default OnlinePaymentConfirmation2

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
