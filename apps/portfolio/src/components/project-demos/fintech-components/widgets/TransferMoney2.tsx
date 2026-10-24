'use client'

import { ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const VisaWhite = '/images/projects/fintech-components/credit-card/visa-white.svg'

export interface TransferMoney2Card {
  id: string
  gradient: string
  balance?: string
  maskedNumber?: string
}

export interface TransferMoney2Recipient {
  name: string
  initials: string
  avatarColor: string
  network: string
  maskedNumber: string
}

export interface TransferMoney2Props {
  className?: string
  loading?: boolean
  showHeader?: boolean
  title?: string
  cards?: TransferMoney2Card[]
  recipient?: TransferMoney2Recipient
  amount?: number
}

const defaultCards: TransferMoney2Card[] = [
  { id: 'peach', gradient: 'bg-gradient-to-br from-[#6e8b75] via-[#e77879] to-[#fbddb3]' },
  {
    id: 'visa',
    gradient: 'bg-gradient-to-br from-[#4dcbdc] to-[#1d689f]',
    balance: '$3,981.80',
    maskedNumber: '**** 6542',
  },
  { id: 'mint', gradient: 'bg-gradient-to-br from-[#66d4bf] to-[#3bb98c]' },
]

const defaultRecipient: TransferMoney2Recipient = {
  name: 'Tony Williams',
  initials: 'KW',
  avatarColor: 'bg-[#03c7aa]',
  network: 'Visa',
  maskedNumber: '****0214',
}

export function TransferMoney2({
  className,
  loading: forcedLoading,
  showHeader = true,
  title = 'Transfer Money',
  cards = defaultCards,
  recipient = defaultRecipient,
  amount = 500,
}: TransferMoney2Props) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [activeCard, setActiveCard] = React.useState(1)
  const [value, setValue] = React.useState(String(amount))
  const [sent, setSent] = React.useState(false)

  function handleSend() {
    setSent(true)
    window.setTimeout(() => setSent(false), 1800)
  }

  if (loading) {
    return (
      <div
        className={cn(
 'flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6',
          className,
        )}
      >
        {showHeader && (
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        )}
        <div className="flex w-full flex-col items-center gap-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-1.5 rounded-full" />
            <Skeleton className="h-1.5 w-8 rounded-full" />
            <Skeleton className="size-1.5 rounded-full" />
          </div>
          <Skeleton className="h-[74px] w-full rounded-xl" />
        </div>
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-12 w-32 rounded-xl" />
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
      {showHeader && (
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            aria-label="More options"
            onClick={refresh}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex w-full flex-col items-center gap-4">
        <div className="relative h-20 w-[calc(100%+3rem)] overflow-hidden">
          {cards.map((card, i) => {
            const offset = i - activeCard
            if (Math.abs(offset) > 1) return null
            const isFront = offset === 0
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveCard(i)}
                aria-label={`Select card ${i + 1}`}
                aria-pressed={isFront}
                aria-hidden={!isFront}
                tabIndex={isFront ? 0 : -1}
                className={cn(
                  'absolute inset-y-0 left-7 right-7 flex items-center justify-between rounded-xl px-6 py-5 text-left outline-none transition-all duration-300 ease-out',
                  card.gradient,
                  isFront
                    ? 'z-10 translate-x-0 scale-100 opacity-100'
                    : offset < 0
                      ? 'z-0 -translate-x-[98%] scale-90 opacity-70'
                      : 'z-0 translate-x-[98%] scale-90 opacity-70',
                  'focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
                style={{ pointerEvents: isFront ? 'auto' : 'none' }}
              >
                {card.balance ? (
                  <>
                    <div className="flex h-full flex-col justify-between text-white">
                      <span className="text-xs tracking-[0.12px]">Card Balance</span>
                      <span className="text-lg font-semibold">{card.balance}</span>
                    </div>
                    <div className="flex h-full flex-col items-end justify-between">
                      <span className="text-sm font-medium text-white">{card.maskedNumber}</span>
                      <img src={VisaWhite} alt="Visa" className="h-3.5 w-[50px] object-contain" />
                    </div>
                  </>
                ) : (
                  <span className="sr-only">Card</span>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          {cards.map((card, i) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveCard(i)}
              aria-label={`Go to card ${i + 1}`}
              aria-current={activeCard === i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                activeCard === i ? 'w-8 bg-primary' : 'w-1.5 bg-primary/20 hover:bg-primary/40',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl bg-muted py-2.5 pr-5 pl-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Change recipient, currently ${recipient.name}`}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-[60px] shrink-0 items-center justify-center rounded-full text-lg font-medium text-white',
                recipient.avatarColor,
              )}
            >
              {recipient.initials}
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-foreground">{recipient.name}</p>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>{recipient.network}</span>
                <span className="size-0.5 rounded-full bg-muted-foreground" />
                <span>{recipient.maskedNumber}</span>
              </div>
            </div>
          </div>
          <ChevronDown className="size-6 shrink-0 text-muted-foreground" />
        </button>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-semibold tracking-[-0.32px] text-foreground">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ''))}
              aria-label="Amount to send"
              className="w-24 bg-transparent text-3xl font-semibold tracking-[-0.32px] text-foreground outline-none"
            />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No commission</p>
        </div>
        <Button size="lg" className="rounded-xl px-6 py-3 text-base font-semibold" onClick={handleSend}>
          {sent ? 'Sent!' : 'Send Money'}
        </Button>
      </div>
      {sent && (
        <p role="status" className="w-full text-right text-sm text-success">
          ${value || '0'} sent to {recipient.name}
        </p>
      )}
    </div>
  )
}

export default TransferMoney2

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
