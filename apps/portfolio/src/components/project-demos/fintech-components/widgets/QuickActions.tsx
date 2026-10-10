'use client'

import { ArrowDownLeft, ArrowUpRight, CreditCard, MoreHorizontal, Plus } from 'lucide-react'
import * as React from 'react'

import { ActionButtonCard } from '@/components/project-demos/fintech-components/ui/action-button-card'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
}

export interface QuickActionsProps {
  className?: string
  loading?: boolean
  title?: string
  actions?: QuickAction[]
  onAction?: (id: string) => void
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { id: 'send', label: 'Send', icon: <ArrowUpRight className="size-5" /> },
  { id: 'request', label: 'Request', icon: <ArrowDownLeft className="size-5" /> },
  { id: 'topup', label: 'Top up', icon: <Plus className="size-5" /> },
  { id: 'card', label: 'Card', icon: <CreditCard className="size-5" /> },
]

function QuickActionsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex justify-between px-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickActions({
  className,
  loading: loadingProp,
  title = 'Quick Actions',
  actions = DEFAULT_ACTIONS,
  onAction,
}: QuickActionsProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)

  if (loading) return <QuickActionsSkeleton className={className} />

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button variant="secondary" size="icon-sm" className="rounded-full" aria-label="Refresh actions" onClick={refresh}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex justify-between px-2">
        {actions.map((action) => (
          <ActionButtonCard
            key={action.id}
            size="md"
            icon={action.icon}
            label={action.label}
            onClick={() => onAction?.(action.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default QuickActions
