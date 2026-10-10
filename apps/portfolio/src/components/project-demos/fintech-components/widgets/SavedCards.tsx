'use client'

import { ChevronRight, MoreHorizontal, Plus } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const cardArt = '/images/projects/fintech-components/saved-cards/card-art.png'

export interface SavedCard {
  id: string
  bank: string
  network: string
  last4: string
  balance: number
}

export interface SavedCardsProps {
  className?: string
  loading?: boolean
  title?: string
  cards?: SavedCard[]
}

const DEFAULT_CARDS: SavedCard[] = [
  { id: 'card-1', bank: 'Nord Bank', network: 'Mastercard', last4: '2169', balance: 14586 },
  { id: 'card-2', bank: 'Nord Bank', network: 'Mastercard', last4: '4735', balance: 35145 },
]

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function SavedCardsSkeleton({ className }: { className?: string }) {
  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-muted p-4">
            <Skeleton className="h-[60px] w-[101px] shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="flex w-full gap-2">
        <Skeleton className="h-[60px] flex-1 rounded-2xl" />
        <Skeleton className="h-[60px] flex-1 rounded-2xl" />
      </div>
    </div>
  )
}

export function SavedCards({
  className,
  loading: loadingProp,
  title = 'Saved cards',
  cards = DEFAULT_CARDS,
}: SavedCardsProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [savedIds, setSavedIds] = React.useState<string[]>([])

  if (loading) return <SavedCardsSkeleton className={className} />

  function handleSave() {
    if (!selectedId) return
    setSavedIds((prev) => (prev.includes(selectedId) ? prev : [...prev, selectedId]))
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button
          variant="secondary"
          size="icon-sm"
          className="rounded-full"
          aria-label="Refresh saved cards"
          onClick={refresh}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          const isSelected = selectedId === card.id
          const isSaved = savedIds.includes(card.id)
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedId(isSelected ? null : card.id)}
              aria-pressed={isSelected}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl bg-muted p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected ? 'ring-2 ring-ring' : 'hover:bg-muted/70',
              )}
            >
              <img
                src={cardArt}
                alt=""
                className="h-[60px] w-[101px] shrink-0 rounded-xl object-cover"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span className="truncate text-lg font-semibold">{card.bank}</span>
                  {isSaved && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">Saved</span>
                  )}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {card.network} {card.last4}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-lg font-semibold">{currencyFormatter.format(card.balance).replace('.00', '')}</span>
                <ChevronRight className="size-5 text-muted-foreground" />
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex w-full gap-2">
        <Button
          variant="secondary"
          size="lg"
          className="h-[60px] flex-1 gap-2 rounded-2xl text-lg font-bold"
        >
          <Plus className="size-5" />
          Add New
        </Button>
        <Button
          size="lg"
          className="h-[60px] flex-1 rounded-2xl text-lg font-bold"
          onClick={handleSave}
          disabled={!selectedId}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export default SavedCards

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
