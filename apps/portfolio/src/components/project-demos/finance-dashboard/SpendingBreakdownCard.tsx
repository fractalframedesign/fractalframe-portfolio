'use client'

import { useState } from 'react'

import { cn } from '@/components/project-demos/finance-dashboard/lib/utils'
import { Tile } from '@/components/project-demos/finance-dashboard/ui/tile'

type Segment = { label: string; percent: number; color: string }

type SpendingBreakdownCardProps = {
  available?: string
  availablePercent?: number
  segments?: Segment[]
}

const defaultSegments: Segment[] = [
  { label: 'Groceries', percent: 40, color: 'bg-destructive' },
  { label: 'Clothes', percent: 18, color: 'bg-primary' },
  { label: 'Leisure', percent: 10, color: 'bg-success' },
  { label: 'Car', percent: 8, color: 'bg-foreground/30' },
]

export function SpendingBreakdownCard({
  available = 'AED 5,089.49',
  availablePercent = 46,
  segments = defaultSegments,
}: SpendingBreakdownCardProps) {
  const [focused, setFocused] = useState<string | null>(null)

  return (
    <Tile className="justify-between gap-4">
      <span className="text-xs font-semibold tracking-widest text-muted-foreground">TODAY SPENDING</span>

      <div className="flex h-4 w-full overflow-hidden rounded-full bg-foreground/5">
        {segments.map((segment) => (
          <div
            key={segment.label}
            style={{ width: `${segment.percent}%` }}
            className={cn(
              segment.color,
              'h-full transition-opacity duration-200',
              focused && focused !== segment.label && 'opacity-30',
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {segments.map((segment) => (
          <button
            key={segment.label}
            type="button"
            onMouseEnter={() => setFocused(segment.label)}
            onMouseLeave={() => setFocused(null)}
            onClick={() => setFocused((prev) => (prev === segment.label ? null : segment.label))}
            className="flex items-center gap-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className={cn('h-2 w-2 rounded-full', segment.color)} />
            {segment.label}
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs tracking-wide text-muted-foreground">AVAILABLE</p>
        <p className="mt-1 text-xl font-semibold">
          {available} <span className="text-sm text-muted-foreground">{availablePercent}%</span>
        </p>
      </div>
    </Tile>
  )
}
