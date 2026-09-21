'use client'

import { Check } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export type StepStatus = 'complete' | 'active' | 'upcoming'

export interface StepProps {
  status: StepStatus
  index: number
  size?: 'default' | 'sm'
  className?: string
}

export function Step({ status, index, size = 'default', className }: StepProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-medium tracking-tight',
        size === 'default' ? 'size-8 text-xs' : 'size-6 text-[11px]',
        status === 'complete' && 'bg-primary text-primary-foreground',
        status === 'active' && 'border-2 border-primary text-primary',
        status === 'upcoming' && 'border-2 border-border text-muted-foreground',
        className,
      )}
    >
      {status === 'complete' ? <Check className="size-4" strokeWidth={3} /> : String(index).padStart(2, '0')}
    </div>
  )
}

export function Stepper({ statuses, className }: { statuses: StepStatus[]; className?: string }) {
  return (
    <div className={cn('flex items-center', className)}>
      {statuses.map((status, i) => (
        <React.Fragment key={i}>
          <Step status={status} index={i + 1} />
          {i < statuses.length - 1 && (
            <div className={cn('h-0.5 w-6', status === 'complete' ? 'bg-primary' : 'bg-border')} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
