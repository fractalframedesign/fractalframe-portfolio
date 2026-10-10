'use client'

import { cn } from '@/lib/utils'

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  'aria-label': ariaLabel,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
  className?: string
  'aria-label'?: string
}) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <div className={cn('relative flex h-4 w-full items-center', className)}>
      <div className="absolute h-1.5 w-full rounded-full bg-muted" />
      <div className="absolute h-1.5 rounded-full bg-primary" style={{ width: `${percent}%` }} />
      <input
        type="range"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange?.(Number(e.target.value))}
        className="relative z-10 h-4 w-full cursor-pointer appearance-none bg-transparent outline-none focus-visible:outline-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
      />
    </div>
  )
}
