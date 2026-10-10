'use client'

import { Check, ChevronLeft, ChevronRight, Copy, Eye, EyeOff, Lock, LockOpen, Nfc, RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const VisaWhite = '/images/projects/fintech-components/credit-card/visa-white.svg'

export interface CreditCardData {
  id: string
  holder: string
  number: string
  expiry: string
  theme: 'primary' | 'graphite' | 'gold'
}

export interface CreditCardProps {
  /** Force the loading (skeleton) state via a story control; leave undefined for real interactive loading. */
  loading?: boolean
  /** Cards shown in the carousel, front to back. */
  cards?: CreditCardData[]
  className?: string
}

const defaultCards: CreditCardData[] = [
  { id: 'c1', holder: 'John Carter', number: '1234 5678 9101 1121', expiry: '02/30', theme: 'primary' },
  { id: 'c2', holder: 'John Carter', number: '5412 7534 8890 3346', expiry: '11/28', theme: 'graphite' },
  { id: 'c3', holder: 'John Carter', number: '4485 9021 6673 5590', expiry: '07/29', theme: 'gold' },
]

const themeStyles: Record<CreditCardData['theme'], string> = {
  primary: 'bg-gradient-to-br from-primary via-primary to-accent',
  graphite: 'bg-gradient-to-br from-neutral-700 via-neutral-900 to-black',
  gold: 'bg-gradient-to-br from-warning via-warning/80 to-warning-foreground/40',
}

function maskNumber(number: string) {
  const groups = number.split(' ')
  return groups.map((g, i) => (i === groups.length - 1 ? g : '••••')).join(' ')
}

export function CreditCard({ loading: forcedLoading, cards = defaultCards, className }: CreditCardProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading, 1000)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)
  const [frozenIds, setFrozenIds] = React.useState<Set<string>>(() => new Set())
  const [copied, setCopied] = React.useState(false)
  const copyTimeout = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    return () => window.clearTimeout(copyTimeout.current)
  }, [])

  const count = cards.length
  const active = cards[activeIndex] ?? cards[0]
  const frozen = frozenIds.has(active.id)

  function goTo(index: number) {
    setActiveIndex(((index % count) + count) % count)
    setRevealed(false)
  }

  function toggleFreeze() {
    setFrozenIds((prev) => {
      const next = new Set(prev)
      if (next.has(active.id)) next.delete(active.id)
      else next.add(active.id)
      return next
    })
  }

  async function handleCopy() {
    const digits = active.number.replace(/\s+/g, '')
    try {
      await navigator.clipboard.writeText(digits)
    } catch {
      // clipboard API unavailable — silently ignore, UI still gives feedback below only on success
      return
    }
    setCopied(true)
    window.clearTimeout(copyTimeout.current)
    copyTimeout.current = window.setTimeout(() => setCopied(false), 1600)
  }

  if (loading) {
    return (
      <div
        className={cn(
 'flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 ring-1 ring-border',
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-[256px] w-full rounded-2xl" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-2 w-24 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 ring-1 ring-border',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Credit card
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label={frozen ? 'Unfreeze card' : 'Freeze card'}
            aria-pressed={frozen}
            onClick={toggleFreeze}
          >
            {frozen ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Refresh card details"
            onClick={refresh}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative h-[256px] w-full">
        {cards.map((card, i) => {
          const offset = (i - activeIndex + count) % count
          if (offset > 1) return null
          const isFront = offset === 0
          const isFrozenCard = frozenIds.has(card.id)
          return (
            <div
              key={card.id}
              aria-hidden={!isFront}
              className={cn(
                'absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all duration-300 ease-out',
                themeStyles[card.theme],
                isFront ? 'z-10 translate-x-0 scale-100 opacity-100' : 'z-0 translate-x-6 scale-95 opacity-70',
              )}
              style={{ pointerEvents: isFront ? 'auto' : 'none' }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_-10%,rgba(255,255,255,0.25),transparent_55%)]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Nfc className="size-5 rotate-90" />
                  <span className="text-xs font-semibold tracking-wide">Credit Card</span>
                </div>
                <img src={VisaWhite} alt="Visa" width={44} height={24} className="h-6 w-11 object-contain" />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xl tracking-wider tabular-nums">
                    {isFront && revealed ? card.number : maskNumber(card.number)}
                  </p>
                  {isFront && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setRevealed((v) => !v)}
                        aria-label={revealed ? 'Hide card number' : 'Show card number'}
                        className="rounded-full p-1 text-white/80 outline-none transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Copy card number"
                        className="rounded-full p-1 text-white/80 outline-none transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex gap-8">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-white/60">Card holder&apos;s name</span>
                      <span className="text-sm font-medium">{card.holder}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-white/60">Expiry date</span>
                      <span className="text-sm font-medium">{card.expiry}</span>
                    </div>
                  </div>
                  <div className="h-6 w-8 rounded-md bg-gradient-to-br from-white/70 to-white/40 ring-1 ring-white/40">
                    <div className="mt-1.5 h-px w-full bg-black/20" />
                    <div className="mt-1.5 h-px w-full bg-black/20" />
                  </div>
                </div>
              </div>

              {isFrozenCard && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-sm">
                  <Lock className="size-6 text-white" />
                  <span className="text-sm font-semibold text-white">Card frozen</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          {cards.map((card, i) => (
            <button
              key={card.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show card ending ${card.number.slice(-4)}`}
              aria-current={i === activeIndex}
              className={cn(
                'h-2 rounded-full transition-all',
                i === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-accent hover:bg-accent/70',
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Previous card"
            onClick={() => goTo(activeIndex - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Next card"
            onClick={() => goTo(activeIndex + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreditCard

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
