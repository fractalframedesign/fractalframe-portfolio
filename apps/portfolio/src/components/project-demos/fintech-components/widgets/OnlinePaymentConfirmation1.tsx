'use client'

import { Check, Clock, MoreHorizontal, X } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const merchantLogo = '/images/projects/fintech-components/online-payment-confirmation-1/netflix.png'

export type PaymentConfirmationStatus = 'pending' | 'accepted' | 'declined'

export interface OnlinePaymentConfirmation1Props {
  className?: string
  loading?: boolean
  title?: string
  merchantName?: string
  paymentLabel?: string
  requestedAt?: string
  windowMinutes?: number
}

function OnlinePaymentConfirmation1Skeleton({ className }: { className?: string }) {
  return (
 <div className={cn('flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex w-full flex-col gap-4 rounded-xl bg-muted p-5">
        <Skeleton className="h-3.5 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>
        <div className="flex w-full gap-4">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </div>
        <Skeleton className="h-3.5 w-full" />
      </div>
    </div>
  )
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function OnlinePaymentConfirmation1({
  className,
  loading: loadingProp,
  title = 'Online Payment Confirmation',
  merchantName = 'Netflix subscription payment',
  paymentLabel = 'Netflix payment confirmation...',
  requestedAt = 'Requested at 12:34 PM',
  windowMinutes = 60,
}: OnlinePaymentConfirmation1Props) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [status, setStatus] = React.useState<PaymentConfirmationStatus>('pending')
  const [secondsLeft, setSecondsLeft] = React.useState(windowMinutes * 60)

  React.useEffect(() => {
    if (status !== 'pending') return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [status])

  if (loading) return <OnlinePaymentConfirmation1Skeleton className={className} />

  function handleRefresh() {
    refresh()
    setStatus('pending')
    setSecondsLeft(windowMinutes * 60)
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh payment confirmation"
          onClick={handleRefresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-xl bg-muted p-5">
        <p className="text-sm text-muted-foreground">{paymentLabel}</p>

        <div className="flex items-center gap-4">
          <img src={merchantLogo} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-lg font-semibold">{merchantName}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-4" />
              {requestedAt}
            </p>
          </div>
        </div>

        {status === 'pending' ? (
          <>
            <div className="flex w-full items-center gap-4">
              <Button
                variant="secondary"
                className="h-11 flex-1 rounded-xl text-base font-medium"
                onClick={() => setStatus('declined')}
              >
                Not Now
              </Button>
              <Button
                className="h-11 flex-1 rounded-xl text-base font-semibold"
                onClick={() => setStatus('accepted')}
                disabled={secondsLeft === 0}
              >
                Accept
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-muted-foreground">
                {secondsLeft > 0 ? (
                  <>
                    This payment must be confirmed within{' '}
                    <span className="font-semibold text-primary">{formatCountdown(secondsLeft)}</span>
                  </>
                ) : (
                  <span className="font-semibold text-destructive">This request has expired</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground/70">
                (after {windowMinutes} min the application will be cancelled)
              </p>
            </div>
          </>
        ) : (
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
              status === 'accepted' ? 'bg-success/15 text-success' : 'bg-secondary text-secondary-foreground',
            )}
            role="status"
          >
            {status === 'accepted' ? <Check className="size-5" /> : <X className="size-5" />}
            {status === 'accepted' ? 'Payment accepted.' : 'Payment declined.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default OnlinePaymentConfirmation1

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
