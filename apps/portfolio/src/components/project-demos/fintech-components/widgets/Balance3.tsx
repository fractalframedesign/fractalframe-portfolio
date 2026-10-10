'use client'

import { ArrowLeftRight, ChevronDown, ListPlus, MoreHorizontal, Plus, Repeat } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Separator } from '@/components/project-demos/fintech-components/ui/separator'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const creditCard = '/images/projects/fintech-components/balance-3/credit-card.png'

export interface Balance3Account {
  id: string
  label: string
  balance: string
}

export interface Balance3Props {
  className?: string
  loading?: boolean
  showHeader?: boolean
  title?: string
  accounts?: Balance3Account[]
  balanceLabel?: string
  otherCardsAmount?: string
}

const defaultAccounts: Balance3Account[] = [
  { id: 'checking', label: 'Checking accounts', balance: '$12,300.00' },
  { id: 'savings', label: 'Savings accounts', balance: '$28,940.15' },
  { id: 'business', label: 'Business accounts', balance: '$4,102.60' },
]

export function Balance3({
  className,
  loading: forcedLoading,
  showHeader = true,
  title = 'Balance',
  accounts = defaultAccounts,
  balanceLabel = 'Current Balance',
  otherCardsAmount = '$7,460.00',
}: Balance3Props) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [accountIndex, setAccountIndex] = React.useState(0)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [lastAction, setLastAction] = React.useState<string | null>(null)

  const account = accounts[accountIndex] ?? accounts[0]

  function handleAction(label: string) {
    setLastAction(label)
    window.setTimeout(() => setLastAction((cur) => (cur === label ? null : cur)), 1800)
  }

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        )}
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="aspect-[186/114] h-[114px] shrink-0 rounded-xl" />
        </div>
        <div className="flex w-full items-center gap-4">
          <Skeleton className="h-[52px] flex-1 rounded-xl" />
          <Skeleton className="h-[52px] flex-1 rounded-xl" />
          <Skeleton className="h-[52px] flex-1 rounded-xl" />
        </div>
        <Separator />
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      {showHeader && (
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
          <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh balance" onClick={refresh}>
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex w-full flex-col gap-7">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                aria-expanded={pickerOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1 rounded-md text-base font-medium tracking-[0.16px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {account.label}
                <ChevronDown className={cn('size-6 transition-transform', pickerOpen && 'rotate-180')} />
              </button>
              {pickerOpen && (
                <div
                  role="listbox"
                  className="absolute top-full left-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-lg"
                >
                  {accounts.map((a, i) => (
                    <button
                      key={a.id}
                      type="button"
                      role="option"
                      aria-selected={i === accountIndex}
                      onClick={() => {
                        setAccountIndex(i)
                        setPickerOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-2 text-left text-sm outline-none hover:bg-accent',
                        i === accountIndex && 'text-primary',
                      )}
                    >
                      <span>{a.label}</span>
                      <span className="text-muted-foreground">{a.balance}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-3xl font-bold tracking-[-0.32px] text-foreground">{account.balance}</p>
            <p className="text-base font-medium tracking-[0.16px] text-muted-foreground">{balanceLabel}</p>
          </div>
          <img src={creditCard} alt="Debit card" className="aspect-[186/114] h-[114px] shrink-0 rounded-xl object-contain" />
        </div>

        <div className="flex w-full items-center gap-4">
          <Button className="flex-1 justify-start gap-0 rounded-xl py-3 pr-4 pl-3 text-base font-semibold" onClick={() => handleAction('Deposit')}>
            <ArrowLeftRight className="size-6" />
            <span className="flex-1 text-center">Deposit</span>
          </Button>
          <Button
            variant="secondary"
            className="flex-1 justify-start gap-0 rounded-xl py-3 pr-4 pl-3 text-base font-semibold text-foreground"
            onClick={() => handleAction('Transfer')}
          >
            <Repeat className="size-6" />
            <span className="flex-1 text-center">Transfer</span>
          </Button>
          <Button
            variant="secondary"
            className="flex-1 justify-start gap-0 rounded-xl py-3 pr-4 pl-3 text-base font-semibold text-foreground"
            onClick={() => handleAction('Details')}
          >
            <MoreHorizontal className="size-6" />
            <span className="flex-1 text-center">Details</span>
          </Button>
        </div>

        <Separator />

        <div className="flex w-full items-center justify-between pb-1">
          <div className="flex flex-col gap-0.5">
            <p className="text-base font-medium tracking-[0.16px] text-muted-foreground">Funds on Other Cards</p>
            <p className="text-2xl font-semibold tracking-[0.24px] text-foreground">{otherCardsAmount}</p>
          </div>
          <Button
            variant="outline"
            className="gap-0 rounded-xl py-3 pr-4 pl-3 text-base font-semibold"
            onClick={() => handleAction('Add Funds')}
          >
            <Plus className="size-6" />
            <span className="pl-2">Add Funds</span>
          </Button>
        </div>
      </div>

      {lastAction && (
        <p role="status" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ListPlus className="size-3.5 shrink-0 text-primary" />
          {lastAction} action started.
        </p>
      )}
    </div>
  )
}

export default Balance3

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
