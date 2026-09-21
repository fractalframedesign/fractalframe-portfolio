'use client'

import { Check, ChevronDown, ChevronRight, Copy, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Card } from '@/components/project-demos/fintech-components/ui/card'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const bitcoinIcon = '/images/projects/fintech-components/transactions/bitcoin.svg'
const ethereumIcon = '/images/projects/fintech-components/transactions/ethereum.svg'
const litecoinIcon = '/images/projects/fintech-components/transactions/litecoin.svg'

export interface TransactionEntry {
  id: string
  name: string
  date: string
  amount: number
  status: 'Success' | 'Pending' | 'Failed'
  icon: 'bitcoin' | 'ethereum' | 'litecoin'
  reference: string
}

export interface Transactions3Props {
  loading?: boolean
  className?: string
  showHeader?: boolean
  title?: string
  description?: string
  transactions?: TransactionEntry[]
}

const ICONS: Record<TransactionEntry['icon'], string> = {
  bitcoin: bitcoinIcon,
  ethereum: ethereumIcon,
  litecoin: litecoinIcon,
}

const DEFAULT_TRANSACTIONS: TransactionEntry[] = [
  { id: 'dave', name: 'Dave', date: 'Sep 18, 2024', amount: 21553, status: 'Success', icon: 'bitcoin', reference: 'TXN-8f21-BTC-4471' },
  { id: 'steven', name: 'Steven', date: 'Sep 18, 2024', amount: 20000, status: 'Success', icon: 'ethereum', reference: 'TXN-2c90-ETH-9925' },
  { id: 'john', name: 'John', date: 'Sep 20, 2024', amount: 3333, status: 'Success', icon: 'litecoin', reference: 'TXN-af03-LTC-1187' },
]

const STATUS_TEXT: Record<TransactionEntry['status'], string> = {
  Success: 'text-success',
  Pending: 'text-warning-foreground',
  Failed: 'text-destructive',
}

const RANGE_LABELS = ['All dates', 'This week', 'This month']

function Row({ tx }: { tx: TransactionEntry }) {
  const [expanded, setExpanded] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [copied])

  function handleCopy(event: React.MouseEvent) {
    event.stopPropagation()
    navigator.clipboard?.writeText(tx.reference).catch(() => {})
    setCopied(true)
  }

  return (
    <div className="w-full overflow-hidden rounded-xl bg-muted">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card">
          <img src={ICONS[tx.icon]} alt="" className="size-full object-cover" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-lg font-semibold text-foreground">{tx.name}</span>
          <span className="truncate text-sm font-medium text-muted-foreground">{tx.date}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <span className="text-lg font-semibold text-foreground tabular-nums">
            ${tx.amount.toLocaleString('en-US')}
          </span>
          <span className={cn('text-sm font-medium', STATUS_TEXT[tx.status])}>{tx.status}</span>
        </span>
        <ChevronRight className={cn('size-5 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-90')} />
      </button>
      {expanded && (
        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-sm">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Reference ID</span>
            <span className="truncate font-mono text-foreground">{tx.reference}</span>
          </div>
          <Button type="button" variant="ghost" size="sm" className="shrink-0 gap-1.5 text-xs" onClick={handleCopy}>
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
  )
}

export function Transactions3({
  loading: loadingProp,
  className,
  showHeader = true,
  title = 'Transactions',
  description = 'View and manage your recent transactions easily.',
  transactions = DEFAULT_TRANSACTIONS,
}: Transactions3Props) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [rangeIndex, setRangeIndex] = React.useState(0)
  const [menuOpen, setMenuOpen] = React.useState(false)

  if (loading) {
    return (
      <Card className={cn('flex max-w-[480px] flex-col gap-5 p-6', className)}>
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex w-full flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex w-full items-center gap-3 rounded-xl bg-muted p-4">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex flex-col items-end gap-2">
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
    <Card className={cn('flex max-w-[480px] flex-col gap-4 p-6', className)}>
      {showHeader && (
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-normal uppercase tracking-[0.03em] text-muted-foreground">
            {title}
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="relative shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full"
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {RANGE_LABELS[rangeIndex]}
                <ChevronDown className={cn('size-4 transition-transform', menuOpen && 'rotate-180')} />
              </Button>
              {menuOpen && (
                <div
                  role="listbox"
                  aria-label="Select date range"
                  className="absolute right-0 top-full z-10 mt-1.5 w-36 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md"
                >
                  {RANGE_LABELS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      role="option"
                      aria-selected={index === rangeIndex}
                      onClick={() => {
                        setRangeIndex(index)
                        setMenuOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                        index === rangeIndex ? 'text-primary' : 'text-popover-foreground',
                      )}
                    >
                      {label}
                      {index === rangeIndex && <Check className="size-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="rounded-full"
              aria-label={`Refresh ${title}`}
              onClick={refresh}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
      )}

      <div className="flex w-full flex-col gap-3">
        {transactions.map((tx) => (
          <Row key={tx.id} tx={tx} />
        ))}
      </div>
    </Card>
  )
}

export default Transactions3

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
