'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const iconVariants = cva('flex items-center justify-center rounded-full bg-foreground text-background [&_svg]:shrink-0', {
  variants: {
    size: {
      sm: 'size-10 [&_svg]:size-4',
      md: 'size-12 [&_svg]:size-5',
      lg: 'size-[58px] [&_svg]:size-6',
      xl: 'size-[72px] [&_svg]:size-8',
    },
  },
  defaultVariants: { size: 'sm' },
})

export interface ActionButtonCardProps extends VariantProps<typeof iconVariants> {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
}

export function ActionButtonCard({ icon, label, onClick, size, className }: ActionButtonCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn('flex flex-col items-center gap-2 outline-none', className)}
    >
      <span className={iconVariants({ size })}>{icon}</span>
      <span className="text-sm font-medium tracking-tight text-foreground">{label}</span>
    </motion.button>
  )
}
