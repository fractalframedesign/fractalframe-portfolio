'use client'

import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { Stepper, type StepStatus } from '@/components/project-demos/fintech-components/ui/step'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface VerificationStepsProps {
  className?: string
  loading?: boolean
  title?: string
  labels?: string[]
  activeIndex?: number
}

const DEFAULT_LABELS = ['Identity', 'Address', 'Income', 'Review']

function statusesFor(labels: string[], activeIndex: number): StepStatus[] {
  return labels.map((_, i) => (i < activeIndex ? 'complete' : i === activeIndex ? 'active' : 'upcoming'))
}

function VerificationStepsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <Skeleton className="size-8 rounded-full" />
            {i < 3 && <Skeleton className="h-0.5 w-6" />}
          </React.Fragment>
        ))}
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  )
}

export function VerificationSteps({
  className,
  loading: loadingProp,
  title = 'Account Verification',
  labels = DEFAULT_LABELS,
  activeIndex: activeIndexProp = 1,
}: VerificationStepsProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [activeIndex, setActiveIndex] = React.useState(activeIndexProp)
  const isLast = activeIndex >= labels.length - 1

  if (loading) return <VerificationStepsSkeleton className={className} />

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-6 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button variant="secondary" size="icon-sm" className="rounded-full" aria-label="Refresh verification" onClick={refresh}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <Stepper statuses={statusesFor(labels, activeIndex)} />

      <p className="text-sm font-medium text-foreground">
        Step {activeIndex + 1} of {labels.length}: {labels[activeIndex]}
      </p>

      <Button
        size="lg"
        className="h-11 w-full rounded-xl"
        onClick={() => {
          if (isLast) refresh()
          else setActiveIndex((i) => Math.min(i + 1, labels.length - 1))
        }}
      >
        {isLast ? 'Submit' : 'Continue'}
      </Button>
    </div>
  )
}

export default VerificationSteps
