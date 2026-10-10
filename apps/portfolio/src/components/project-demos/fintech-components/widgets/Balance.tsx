'use client'

import { ArrowDownLeft, ArrowUpRight, Check, ChevronDown, Copy, Eye, EyeOff, MoreHorizontal, Plus } from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback } from '@/components/project-demos/fintech-components/ui/avatar'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface CurrencyOption {
  code: string
  symbol: string
  rate: number
}

export interface BalanceProps {
  loading?: boolean
  className?: string
  title?: string
  ownerName?: string
  ownerInitials?: string
  accountLabel?: string
  balance?: number
  delta?: number
  accountNumber?: string
  currencies?: CurrencyOption[]
}

const DEFAULT_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
]

function formatAmount(value: number, symbol: string) {
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function Balance({
  loading: loadingProp,
  className,
  title = 'Balance',
  ownerName = 'Kristina Watson',
  ownerInitials = 'KW',
  accountLabel = 'All Accounts · Total Balance',
  balance = 14300,
  delta = 233,
  accountNumber = 'GB29 NWBK 6016 1331 9268 19',
  currencies = DEFAULT_CURRENCIES,
}: BalanceProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [currencyIndex, setCurrencyIndex] = React.useState(0)
  const [currencyMenuOpen, setCurrencyMenuOpen] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [receiveOpen, setReceiveOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const currency = currencies[currencyIndex] ?? currencies[0]

  React.useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [copied])

  function handleCopyAccount() {
    navigator.clipboard?.writeText(accountNumber).catch(() => {})
    setCopied(true)
  }

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-12 p-6', className)}>
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-8 rounded-full" />
          </div>
          <div className="flex w-full items-center justify-between rounded-full bg-muted p-2">
            <div className="flex items-center gap-3">
              <Skeleton className="size-[50px] rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="size-11 rounded-full" />
          </div>
        </div>
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-11 w-48" />
            </div>
            <Skeleton className="h-11 w-20 rounded-full" />
          </div>
          <div className="flex w-full gap-2">
            <Skeleton className="h-[60px] flex-1 rounded-2xl" />
            <Skeleton className="h-[60px] flex-1 rounded-2xl" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-8 p-6', className)}>
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-normal uppercase tracking-[0.03em] text-muted-foreground">
            {title}
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Refresh balance"
            onClick={refresh}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between rounded-full bg-muted p-2">
          <div className="flex items-center gap-0">
            <Avatar className="size-[50px] bg-primary">
              <AvatarFallback className="bg-primary text-base font-medium text-primary-foreground">
                {ownerInitials}
              </AvatarFallback>
            </Avatar>
            <p className="pl-4 text-lg font-medium text-foreground">{ownerName}</p>
          </div>
          <Button
            type="button"
            size="icon"
            className="rounded-full bg-foreground text-background hover:opacity-90"
            aria-label="Add account"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-muted-foreground">{accountLabel}</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-[48px] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground tabular-nums">
                {visible ? formatAmount(balance * currency.rate, currency.symbol) : '••••••'}
              </p>
              {visible && (
                <span className="pb-1 text-base font-medium text-muted-foreground">
                  +{formatAmount(delta * currency.rate, currency.symbol)}
                </span>
              )}
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide balance' : 'Show balance'}
                aria-pressed={!visible}
                className="mb-1 rounded-full p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
            </div>
          </div>
          <div className="relative shrink-0">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full px-3"
              aria-haspopup="listbox"
              aria-expanded={currencyMenuOpen}
              onClick={() => setCurrencyMenuOpen((v) => !v)}
            >
              {currency.code}
              <ChevronDown className={cn('size-4 transition-transform', currencyMenuOpen && 'rotate-180')} />
            </Button>
            {currencyMenuOpen && (
              <div
                role="listbox"
                aria-label="Select currency"
                className="absolute right-0 top-full z-10 mt-1.5 w-28 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md"
              >
                {currencies.map((option, index) => (
                  <button
                    key={option.code}
                    type="button"
                    role="option"
                    aria-selected={index === currencyIndex}
                    onClick={() => {
                      setCurrencyIndex(index)
                      setCurrencyMenuOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                      index === currencyIndex ? 'text-primary' : 'text-popover-foreground',
                    )}
                  >
                    {option.code}
                    {index === currencyIndex && <Check className="size-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-auto flex-1 gap-2 rounded-2xl py-5 text-lg font-bold text-secondary-foreground"
            aria-pressed={receiveOpen}
            onClick={() => setReceiveOpen((v) => !v)}
          >
            <ArrowDownLeft className="size-4.5" />
            Receive
          </Button>
          <Button type="button" className="h-auto flex-1 gap-2 rounded-2xl py-5 text-lg font-bold" onClick={refresh}>
            <ArrowUpRight className="size-4.5" />
            Send
          </Button>
        </div>

        {receiveOpen && (
          <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-muted px-4 py-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">Your account number</span>
              <span className="truncate font-mono text-sm text-foreground">{accountNumber}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={handleCopyAccount}
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-success" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default Balance

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
