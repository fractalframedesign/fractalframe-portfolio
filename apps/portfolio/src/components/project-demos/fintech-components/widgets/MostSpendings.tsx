'use client'

import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  GraduationCap,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SpendingCategory {
  id: string
  name: string
  amount: number
  transactions: { label: string; amount: number }[]
  icon: 'food' | 'shopping' | 'education' | 'subscriptions'
}

export interface MostSpendingsProps {
  className?: string
  loading?: boolean
  showHeader?: boolean
  layout?: 'grid' | 'list'
  title?: string
  categories?: SpendingCategory[]
}

const ICONS: Record<SpendingCategory['icon'], React.ComponentType<{ className?: string }>> = {
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  education: GraduationCap,
  subscriptions: Sparkles,
}

const defaultCategories: SpendingCategory[] = [
  {
    id: 'food',
    name: 'Food & Beverages',
    amount: 3200,
    icon: 'food',
    transactions: [
      { label: 'Blue Bottle Coffee', amount: 12.4 },
      { label: 'Whole Foods Market', amount: 86.2 },
      { label: 'Uber Eats', amount: 34.5 },
    ],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    amount: 10340,
    icon: 'shopping',
    transactions: [
      { label: 'Zara', amount: 210 },
      { label: 'Amazon', amount: 64.99 },
      { label: 'Nike Store', amount: 128 },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    amount: 8400,
    icon: 'education',
    transactions: [
      { label: 'Coursera', amount: 49 },
      { label: 'Udemy', amount: 19.99 },
      { label: 'University fee', amount: 800 },
    ],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    amount: 5199,
    icon: 'subscriptions',
    transactions: [
      { label: 'Spotify', amount: 10.99 },
      { label: 'Netflix', amount: 15.49 },
      { label: 'iCloud+', amount: 2.99 },
    ],
  },
]

function CategoryCard({ category, expanded, onToggle }: { category: SpendingCategory; expanded: boolean; onToggle: () => void }) {
  const Icon = ICONS[category.icon]
  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-xl bg-muted p-3">
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent">
            <Icon className="size-5 text-accent-foreground" />
          </span>
          <p className="font-semibold text-foreground text-xs tracking-wide">{category.name}</p>
        </div>
        <p className="font-semibold text-foreground text-lg">
          ${category.amount.toLocaleString('en-US')}
          <span className="text-muted-foreground">.00</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-2 py-2 text-secondary-foreground text-sm outline-none transition-colors hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {category.transactions.length} transactions
        <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <ul className="flex flex-col gap-1.5 pt-1 text-xs">
          {category.transactions.map((t) => (
            <li key={t.label} className="flex items-center justify-between text-muted-foreground">
              <span className="truncate">{t.label}</span>
              <span className="shrink-0 text-foreground tabular-nums">${t.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function MostSpendings({
  className,
  loading: forcedLoading,
  showHeader = true,
  layout = 'grid',
  title = 'Most spendings',
  categories = defaultCategories,
}: MostSpendingsProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [sortDesc, setSortDesc] = React.useState(true)

  const sorted = React.useMemo(
    () => [...categories].sort((a, b) => (sortDesc ? b.amount - a.amount : a.amount - b.amount)),
    [categories, sortDesc],
  )

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-3 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        )}
        <div className="grid w-full grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl bg-muted p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
 <div className={cn('flex max-w-[480px] flex-col gap-3 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      {showHeader && (
        <div className="flex w-full items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full bg-secondary"
              aria-label={sortDesc ? 'Sort by amount, ascending' : 'Sort by amount, descending'}
              onClick={() => setSortDesc((v) => !v)}
            >
              {sortDesc ? <ArrowDownAZ className="size-4" /> : <ArrowUpAZ className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full bg-secondary"
              aria-label={`Refresh ${title}`}
              onClick={refresh}
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>
      )}
      <div className={cn('grid w-full gap-3', layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1')}>
        {sorted.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            expanded={expandedId === category.id}
            onToggle={() => setExpandedId((cur) => (cur === category.id ? null : category.id))}
          />
        ))}
      </div>
    </div>
  )
}

export default MostSpendings

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
