'use client'

import { Check } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'default' | 'sm'
  className?: string
  'aria-label'?: string
}

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  size = 'default',
  className,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : internal

  function toggle() {
    if (disabled) return
    const next = !isChecked
    if (!isControlled) setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40',
        size === 'default' ? 'size-6 [&_svg]:size-4' : 'size-4 rounded-[5px] [&_svg]:size-3',
        isChecked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent',
        className,
      )}
    >
      {isChecked && <Check strokeWidth={3} />}
    </button>
  )
}
