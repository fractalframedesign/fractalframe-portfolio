'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  active?: boolean
  disabled?: boolean
  leading?: React.ReactNode
  trailing?: React.ReactNode
  onSelect?: () => void
}

export function Chip({ active, disabled, leading, trailing, onSelect, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'inline-flex min-w-14 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium tracking-tight transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {leading}
      {children}
      {trailing}
    </button>
  )
}
