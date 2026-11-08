'use client'

import { cn } from '@/components/project-demos/fintech-components/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-skeleton rounded-md bg-muted', className)}
      {...props}
    />
  )
}
