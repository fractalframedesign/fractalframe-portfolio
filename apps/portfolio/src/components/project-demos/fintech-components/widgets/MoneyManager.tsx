'use client'

import { ArrowUpRight, MoreHorizontal, Plus, ShoppingBag } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const avatar1 = '/images/projects/fintech-components/money-manager/avatar-1.png'
const avatar2 = '/images/projects/fintech-components/money-manager/avatar-2.png'
const avatar3 = '/images/projects/fintech-components/money-manager/avatar-3.png'
const avatar4 = '/images/projects/fintech-components/money-manager/avatar-4.png'
const avatar5 = '/images/projects/fintech-components/money-manager/avatar-5.png'
const avatar6 = '/images/projects/fintech-components/money-manager/avatar-6.png'

export interface MoneyManagerContact {
  id: string
  name: string
  avatar: string
  bg: string
}

export interface MoneyManagerProps {
  className?: string
  loading?: boolean
  showHeader?: boolean
  title?: string
  operationsTotal?: string
  nextPaymentInDays?: number
  monthLabel?: string
  contacts?: MoneyManagerContact[]
}

const defaultContacts: MoneyManagerContact[] = [
  { id: 'c1', name: 'Mia Torres', avatar: avatar1, bg: 'bg-[#f0e8ff]' },
  { id: 'c2', name: 'Diego Ruiz', avatar: avatar2, bg: 'bg-[#fccbc9]' },
  { id: 'c3', name: 'Ava Chen', avatar: avatar3, bg: 'bg-[#fccbc9]' },
  { id: 'c4', name: 'Noah Silva', avatar: avatar4, bg: 'bg-[#f0e8ff]' },
  { id: 'c5', name: 'Grace Lin', avatar: avatar5, bg: 'bg-[#bce9d3]' },
  { id: 'c6', name: 'Leo Park', avatar: avatar6, bg: 'bg-[#bce9d3]' },
]

export function MoneyManager({
  className,
  loading: forcedLoading,
  showHeader = true,
  title = 'Money Manager',
  operationsTotal = '-$6,463.00',
  nextPaymentInDays = 6,
  monthLabel = 'Expenses in Dec, 2025',
  contacts = defaultContacts,
}: MoneyManagerProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [selectedContact, setSelectedContact] = React.useState<string | null>(null)
  const [showAllContacts, setShowAllContacts] = React.useState(false)

  const visibleContacts = showAllContacts ? contacts : contacts.slice(0, 6)

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-3 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        )}
        <div className="flex w-full gap-3">
          <Skeleton className="h-[164px] flex-1 rounded-xl" />
          <Skeleton className="h-[164px] flex-1 rounded-xl" />
        </div>
        <Skeleton className="h-[124px] w-full rounded-xl" />
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-3 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      {showHeader && (
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
          <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh money manager" onClick={refresh}>
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex w-full items-stretch gap-3">
        <div className="flex flex-1 flex-col justify-between gap-3 rounded-xl bg-muted p-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                <ShoppingBag className="size-6 text-accent-foreground" />
              </span>
              <span className="text-xs font-semibold tracking-[0.12px] text-foreground">All Operations</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{operationsTotal}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-2 py-2 text-sm font-medium text-primary outline-none transition-colors hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Next payment in {nextPaymentInDays} days
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3 rounded-xl bg-muted p-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                <ShoppingBag className="size-6 text-accent-foreground" />
              </span>
              <span className="text-xs font-semibold tracking-[0.12px] text-foreground">All Operations</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{monthLabel}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-2 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Check Balance
            <ArrowUpRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-xl bg-muted p-4">
        <div className="flex w-full items-center justify-between text-sm font-medium tracking-[0.14px]">
          <p className="text-foreground">Quick Money Transfers</p>
          <button
            type="button"
            onClick={() => setShowAllContacts((v) => !v)}
            className="text-primary outline-none hover:underline focus-visible:underline"
          >
            {showAllContacts ? 'Show less' : 'See All'}
          </button>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Add new contact"
            className="z-10 -mr-1 flex size-[60px] shrink-0 items-center justify-center rounded-full bg-foreground text-background outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="size-6" />
          </button>
          {visibleContacts.map((contact, i) => (
            <button
              key={contact.id}
              type="button"
              aria-label={`Send money to ${contact.name}`}
              aria-pressed={selectedContact === contact.id}
              onClick={() => setSelectedContact((cur) => (cur === contact.id ? null : contact.id))}
              style={{ zIndex: visibleContacts.length - i }}
              className={cn(
                '-mr-1 flex size-[60px] shrink-0 overflow-hidden rounded-full border-2 border-card outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                contact.bg,
                selectedContact === contact.id && 'ring-2 ring-primary',
              )}
            >
              <img src={contact.avatar} alt={contact.name} className="size-full object-cover" />
            </button>
          ))}
        </div>
        {selectedContact && (
          <p role="status" className="text-sm text-muted-foreground">
            Selected {contacts.find((c) => c.id === selectedContact)?.name} for a quick transfer.
          </p>
        )}
      </div>
    </div>
  )
}

export default MoneyManager

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
