'use client'

import { motion } from 'motion/react'
import * as React from 'react'

import { useMotion } from '@/components/project-demos/fintech-components/motion/settings'
import { cn } from '@/lib/utils'

const originalSpring = { type: 'spring', stiffness: 600, damping: 32 } as const

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  className,
  disabled,
  'aria-label': ariaLabel,
}: {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
  'aria-label'?: string
}) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false)
  const isControlled = checked !== undefined
  const isOn = isControlled ? checked : internal
  const m = useMotion()

  function toggle() {
    if (disabled) return
    const next = !isOn
    if (!isControlled) setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        'relative inline-flex h-5.5 w-9.5 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        isOn ? 'bg-primary' : 'bg-input',
        className,
      )}
    >
      {/* Studio motion retunes the spring (Bouncy gives an overshoot); otherwise the original one */}
      <motion.span
        className="pointer-events-none block size-4 rounded-full bg-white shadow"
        initial={false}
        animate={{ x: isOn ? 18 : 4 }}
        transition={m.enabled ? m.spring(380) : originalSpring}
      />
    </button>
  )
}
