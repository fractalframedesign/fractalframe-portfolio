'use client'

import { ChevronDown, MoreHorizontal, Plus } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Input } from '@/components/project-demos/fintech-components/ui/input'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const avatar1 = '/images/projects/fintech-components/quick-transfer/avatar-1.png'
const avatar2 = '/images/projects/fintech-components/quick-transfer/avatar-2.png'
const avatar3 = '/images/projects/fintech-components/quick-transfer/avatar-3.png'
const avatar4 = '/images/projects/fintech-components/quick-transfer/avatar-4.png'
const avatar5 = '/images/projects/fintech-components/quick-transfer/avatar-5.png'
const avatar6 = '/images/projects/fintech-components/quick-transfer/avatar-6.png'

export interface QuickTransferContact {
  id: string
  name: string
  avatar: string
}

export interface QuickTransferProps {
  className?: string
  loading?: boolean
  title?: string
  contacts?: QuickTransferContact[]
  cardNumber?: string
  amount?: number
}

const DEFAULT_CONTACTS: QuickTransferContact[] = [
  { id: 'c1', name: 'Maya', avatar: avatar1 },
  { id: 'c2', name: 'Diego', avatar: avatar2 },
  { id: 'c3', name: 'Kenji', avatar: avatar3 },
  { id: 'c4', name: 'Eleanor', avatar: avatar4 },
  { id: 'c5', name: 'Samuel', avatar: avatar5 },
  { id: 'c6', name: 'Priya', avatar: avatar6 },
]

const CURRENCIES = ['USD', 'EUR', 'GBP'] as const

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function QuickTransferSkeleton({ className }: { className?: string }) {
  return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex items-center">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className={cn('size-[60px] shrink-0 rounded-full border-2 border-card', i > 0 && '-ml-1')} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-[54px] w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-[54px] flex-1 rounded-xl" />
          <Skeleton className="h-[54px] w-20 rounded-xl" />
        </div>
      </div>
      <div className="flex w-full gap-2">
        <Skeleton className="h-[60px] flex-1 rounded-2xl" />
        <Skeleton className="h-[60px] flex-1 rounded-2xl" />
      </div>
    </div>
  )
}

export function QuickTransfer({
  className,
  loading: loadingProp,
  title = 'Quick Transfer',
  contacts = DEFAULT_CONTACTS,
  cardNumber: cardNumberProp = '5457 0950 1266 8543',
  amount: amountProp = 500,
}: QuickTransferProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [selectedId, setSelectedId] = React.useState<string | null>(contacts[0]?.id ?? null)
  const [cardNumber, setCardNumber] = React.useState(cardNumberProp)
  const [amount, setAmount] = React.useState(String(amountProp))
  const [currencyIndex, setCurrencyIndex] = React.useState(0)
  const [sent, setSent] = React.useState(false)

  if (loading) return <QuickTransferSkeleton className={className} />

  const currency = CURRENCIES[currencyIndex % CURRENCIES.length]
  const canSend = selectedId !== null && cardNumber.trim().length > 0 && Number(amount) > 0

  function cycleCurrency() {
    setCurrencyIndex((i) => (i + 1) % CURRENCIES.length)
  }

  function handleSend() {
    if (!canSend) return
    refresh()
    setSent(true)
    window.setTimeout(() => setSent(false), 1800)
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh quick transfer"
          onClick={refresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex items-center" role="listbox" aria-label="Select a contact">
        <button
          type="button"
          aria-label="Add new contact"
          className="z-0 flex size-[60px] shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="size-6" />
        </button>
        {contacts.map((contact, i) => {
          const isSelected = selectedId === contact.id
          return (
            <button
              key={contact.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-label={contact.name}
              onClick={() => setSelectedId(contact.id)}
              style={{ zIndex: contacts.length - i }}
              className={cn(
                '-ml-1 flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-card transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isSelected && 'ring-2 ring-ring',
              )}
            >
              <img src={contact.avatar} alt="" className="size-full object-cover" />
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        <Input
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="Card number"
          aria-label="Recipient card number"
          className="h-[54px] rounded-xl bg-muted px-6 text-sm"
        />
        <div className="flex gap-2">
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Amount"
            aria-label="Transfer amount"
            inputMode="decimal"
            className="h-[54px] flex-1 rounded-xl bg-muted px-6 text-sm"
          />
          <button
            type="button"
            onClick={cycleCurrency}
            className="flex h-[54px] shrink-0 items-center gap-1 rounded-xl bg-secondary px-3 text-base font-medium transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Currency: ${currency}, click to change`}
          >
            {currency}
            <ChevronDown className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex w-full gap-2">
        <Button variant="secondary" size="lg" className="h-[60px] flex-1 rounded-2xl text-lg font-bold">
          Add New
        </Button>
        <Button
          size="lg"
          className="h-[60px] flex-1 rounded-2xl text-lg font-bold"
          onClick={handleSend}
          disabled={!canSend}
        >
          {sent ? 'Sent!' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

export default QuickTransfer

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
