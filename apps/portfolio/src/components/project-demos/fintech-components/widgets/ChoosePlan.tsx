'use client'

import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { RadioButtonCard } from '@/components/project-demos/fintech-components/ui/radio-button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface PlanOption {
  id: string
  label: string
  strikethroughValue?: string
  description: string
}

export interface ChoosePlanProps {
  className?: string
  loading?: boolean
  title?: string
  plans?: PlanOption[]
  defaultSelectedId?: string
}

const DEFAULT_PLANS: PlanOption[] = [
  { id: 'yearly', label: '$540/year', strikethroughValue: '$630', description: 'Pay yearly. Save $90' },
  { id: 'monthly', label: '$52.50/month', description: 'Billed monthly, cancel anytime' },
]

function ChoosePlanSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-[100px] w-full rounded-xl" />
        <Skeleton className="h-[100px] w-full rounded-xl" />
      </div>
    </div>
  )
}

export function ChoosePlan({
  className,
  loading: loadingProp,
  title = 'Choose Plan',
  plans = DEFAULT_PLANS,
  defaultSelectedId = plans[0]?.id,
}: ChoosePlanProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId)

  if (loading) return <ChoosePlanSkeleton className={className} />

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button variant="secondary" size="icon-sm" className="rounded-full" aria-label="Refresh plans" onClick={refresh}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div role="radiogroup" aria-label="Plan" className="flex flex-col gap-3">
        {plans.map((plan) => (
          <RadioButtonCard
            key={plan.id}
            checked={selectedId === plan.id}
            onSelect={() => setSelectedId(plan.id)}
            label={plan.label}
            strikethroughValue={plan.strikethroughValue}
            description={plan.description}
          />
        ))}
      </div>
    </div>
  )
}

export default ChoosePlan
