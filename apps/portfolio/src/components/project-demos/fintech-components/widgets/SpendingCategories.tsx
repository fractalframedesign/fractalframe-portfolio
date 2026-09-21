'use client'

import { Car, Home, MoreHorizontal, ShoppingBag, Utensils } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Chip } from '@/components/project-demos/fintech-components/ui/chip'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface SpendingCategory {
  id: string
  label: string
  icon: React.ReactNode
}

export interface SpendingCategoriesProps {
  className?: string
  loading?: boolean
  title?: string
  categories?: SpendingCategory[]
  defaultActiveIds?: string[]
}

const DEFAULT_CATEGORIES: SpendingCategory[] = [
  { id: 'all', label: 'All', icon: null },
  { id: 'food', label: 'Food', icon: <Utensils className="size-4" /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag className="size-4" /> },
  { id: 'transport', label: 'Transport', icon: <Car className="size-4" /> },
  { id: 'home', label: 'Home', icon: <Home className="size-4" /> },
]

function SpendingCategoriesSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function SpendingCategories({
  className,
  loading: loadingProp,
  title = 'Spending Categories',
  categories = DEFAULT_CATEGORIES,
  defaultActiveIds = ['all'],
}: SpendingCategoriesProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [activeIds, setActiveIds] = React.useState(new Set(defaultActiveIds))

  if (loading) return <SpendingCategoriesSkeleton className={className} />

  function toggle(id: string) {
    setActiveIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button variant="secondary" size="icon-sm" className="rounded-full" aria-label="Refresh categories" onClick={refresh}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((category) => (
          <Chip
            key={category.id}
            active={activeIds.has(category.id)}
            onSelect={() => toggle(category.id)}
            leading={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}

export default SpendingCategories
