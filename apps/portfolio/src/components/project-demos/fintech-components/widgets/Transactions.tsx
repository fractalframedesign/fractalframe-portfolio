'use client'

import { Check, ChevronRight, Copy, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/project-demos/fintech-components/ui/avatar'
import { Badge } from '@/components/project-demos/fintech-components/ui/badge'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const bitcoinIcon = '/images/projects/fintech-components/transactions/bitcoin.svg'
const ethereumIcon = '/images/projects/fintech-components/transactions/ethereum.svg'
const litecoinIcon = '/images/projects/fintech-components/transactions/litecoin.svg'

export type TransactionStatus = 'Success' | 'Pending' | 'Failed'

export interface TransactionItem {
  id: string
  name: string
  date: string
  amount: number
  status: TransactionStatus
  icon?: string
}

export interface TransactionsProps {
  loading?: boolean
  className?: string
  title?: string
  description?: string
  transactions?: TransactionItem[]
}

const DEFAULT_TRANSACTIONS: TransactionItem[] = [
  { id: 'txn_8g2k1', name: 'Dave', date: 'Sep 18, 2024', amount: 21553, status: 'Success', icon: bitcoinIcon },
  { id: 'txn_3nf82', name: 'Steven', date: 'Sep 18, 2024', amount: 20000, status: 'Success', icon: ethereumIcon },
  { id: 'txn_7lq90', name: 'John', date: 'Sep 20, 2024', amount: 3333, status: 'Success', icon: litecoinIcon },
  { id: 'txn_pz410', name: 'Amelia', date: 'Sep 21, 2024', amount: 860, status: 'Pending' },
  { id: 'txn_x99zc', name: 'Marcus', date: 'Sep 22, 2024', amount: 1420, status: 'Failed' },
]

const FILTERS = ['All', 'Success', 'Pending', 'Failed'] as const
type Filter = (typeof FILTERS)[number]

const statusBadgeVariant: Record<TransactionStatus, 'success' | 'warning' | 'destructive'> = {
  Success: 'success',
  Pending: 'warning',
  Failed: 'destructive',
}

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

export function Transactions({
  loading: loadingProp,
  className,
  title = 'Transactions',
  description = 'View and manage your recent transactions easily.',
  transactions = DEFAULT_TRANSACTIONS,
}: TransactionsProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [filter, setFilter] = React.useState<Filter>('All')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const filtered = React.useMemo(
    () => (filter === 'All' ? transactions : transactions.filter((t) => t.status === filter)),
    [filter, transactions],
  )

  React.useEffect(() => {
    if (!copiedId) return
    const timeout = window.setTimeout(() => setCopiedId(null), 1500)
    return () => window.clearTimeout(timeout)
  }, [copiedId])

  function handleCopy(id: string) {
    navigator.clipboard?.writeText(id).catch(() => {})
    setCopiedId(id)
  }

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-6 p-6', className)}>
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-full max-w-[420px]" />
        </div>
        <div className="flex w-full flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex w-full items-center gap-3 rounded-xl bg-muted p-4">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('flex max-w-[480px] flex-col gap-6 p-6', className)}>
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
            aria-label="Refresh transactions"
            onClick={refresh}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        <p className="text-base leading-normal text-muted-foreground">{description}</p>
        <div role="group" aria-label="Filter transactions by status" className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                filter === option
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        {filtered.length === 0 && (
          <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">
            No {filter.toLowerCase()} transactions.
          </p>
        )}
        {filtered.map((item) => {
          const expanded = expandedId === item.id
          return (
            <div key={item.id} className="w-full overflow-hidden rounded-xl bg-muted">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : item.id)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <Avatar className="size-12 shrink-0 bg-card">
                  {item.icon ? (
                    <AvatarImage src={item.icon} alt="" className="object-contain p-2" />
                  ) : (
                    <AvatarFallback>{initials(item.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <p className="truncate text-lg font-semibold leading-tight text-foreground">{item.name}</p>
                  <p className="truncate text-sm font-medium text-muted-foreground">{item.date}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex flex-col items-end gap-0.5">
                    <p className="text-lg font-semibold leading-tight text-foreground">{currency(item.amount)}</p>
                    <Badge variant={statusBadgeVariant[item.status]}>{item.status}</Badge>
                  </div>
                  <ChevronRight
                    className={cn('size-5 text-muted-foreground transition-transform', expanded && 'rotate-90')}
                  />
                </div>
              </button>
              {expanded && (
                <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                  <span className="truncate font-mono text-xs text-muted-foreground">{item.id}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 gap-1.5 text-xs"
                    onClick={() => handleCopy(item.id)}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="size-3.5 text-success" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> Copy ID
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default Transactions

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
