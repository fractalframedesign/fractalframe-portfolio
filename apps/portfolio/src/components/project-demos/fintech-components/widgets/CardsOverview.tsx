'use client'

import { ArrowUpRight, Check, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const mastercardLogo = '/images/projects/fintech-components/cards/mastercard-logo.svg'

export interface BankCard {
  id: string
  bank: string
  last4: string
  balance: number
}

export interface CardsOverviewProps {
  className?: string
  loading?: boolean
  title?: string
  changePercent?: number
  cards?: BankCard[]
}

const DEFAULT_CARDS: BankCard[] = [
  { id: 'c1', bank: 'Horizon', last4: '2584', balance: 14854 },
  { id: 'c2', bank: 'Nord Bank', last4: '1743', balance: 8943 },
  { id: 'c3', bank: 'Nord Bank', last4: '4736', balance: 109690 },
]

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

export function CardsOverview({
  className,
  loading: loadingProp,
  title = 'Cards',
  changePercent = 2.03,
  cards = DEFAULT_CARDS,
}: CardsOverviewProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [revealed, setRevealed] = React.useState(true)
  const [selectedId, setSelectedId] = React.useState<string>(cards[0]?.id ?? '')
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const total = cards.reduce((sum, c) => sum + c.balance, 0)

  async function copyNumber(card: BankCard) {
    const masked = `•••• •••• •••• ${card.last4}`
    try {
      await navigator.clipboard.writeText(masked)
    } catch {
      // clipboard unavailable — still show confirmation for demo purposes
    }
    setCopiedId(card.id)
    window.setTimeout(() => setCopiedId((id) => (id === card.id ? null : id)), 1500)
  }

  return (
    <Card className={cn('max-w-[480px] p-6', className)}>
      <CardHeader className="gap-4 p-0">
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-wide text-muted-foreground">{title}</p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="icon-sm"
              className="rounded-full"
              aria-label={revealed ? 'Hide balances' : 'Show balances'}
              onClick={() => setRevealed((v) => !v)}
            >
              {revealed ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              className="rounded-full"
              aria-label="Refresh cards"
              onClick={refresh}
            >
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {revealed ? formatCurrency(total) : '••••••'}
              </p>
              <p className="text-sm text-muted-foreground">Activity summary</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-primary">
              <ArrowUpRight className="size-4" />
              <span className="text-base font-medium">{changePercent}%</span>
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 pt-6">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[62px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cards.map((card) => {
              const isSelected = selectedId === card.id
              const isCopied = copiedId === card.id
              return (
                <div
                  key={card.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(card.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(card.id)
                    }
                  }}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected && 'ring-2 ring-primary',
                  )}
                >
                  <img src={mastercardLogo} alt="" className="h-7 w-9 shrink-0" width={36} height={28} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-lg font-semibold text-foreground">{card.bank}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyNumber(card)
                      }}
                      className="flex w-fit items-center gap-1 rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Copy card number ending ${card.last4}`}
                    >
                      Mastercard {card.last4}
                      {isCopied ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="shrink-0 text-lg font-semibold text-foreground">
                    {revealed ? formatCurrency(card.balance) : '••••••'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CardsOverview

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
