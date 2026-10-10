'use client'

import { Check } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface RadioButtonProps {
  checked?: boolean
  disabled?: boolean
  onSelect?: () => void
  className?: string
  'aria-label'?: string
}

export function RadioButton({ checked, disabled, onSelect, className, 'aria-label': ariaLabel }: RadioButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/60 bg-transparent',
        className,
      )}
    >
      {checked && <Check className="size-4" strokeWidth={3} />}
    </button>
  )
}

export interface RadioButtonCardProps {
  checked?: boolean
  onSelect?: () => void
  label: string
  strikethroughValue?: string
  description?: string
  className?: string
}

export function RadioButtonCard({
  checked,
  onSelect,
  label,
  strikethroughValue,
  description,
  className,
}: RadioButtonCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-accent' : 'bg-muted',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          {strikethroughValue && (
            <span className="text-base text-muted-foreground line-through">{strikethroughValue}</span>
          )}
          <span className="text-lg font-semibold text-foreground">{label}</span>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {/* Visual indicator only: the card itself is the radio, and buttons cannot nest */}
      <span
        aria-hidden="true"
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/60 bg-transparent',
        )}
      >
        {checked && <Check className="size-4" strokeWidth={3} />}
      </span>
    </button>
  )
}
