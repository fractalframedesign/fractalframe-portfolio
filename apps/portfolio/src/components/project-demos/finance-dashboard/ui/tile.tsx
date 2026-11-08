import type { ReactNode } from 'react'

import { cn } from '@/components/project-demos/finance-dashboard/lib/utils'

type TileProps = {
  children: ReactNode
  className?: string
  tone?: 'dark' | 'violet' | 'rose'
  as?: 'div' | 'button'
  onClick?: () => void
}

const toneClasses: Record<NonNullable<TileProps['tone']>, string> = {
  dark: 'bg-card border border-border',
  violet:
    'bg-gradient-to-br from-primary to-[color-mix(in_oklab,var(--primary)_70%,var(--background))] border border-primary/40',
  rose: 'bg-gradient-to-br from-destructive to-[color-mix(in_oklab,var(--destructive)_75%,var(--background))] border border-destructive/40',
}

export function Tile({ children, className, tone = 'dark', as = 'div', onClick }: TileProps) {
  const Comp = as as 'div'
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-[1.75rem] p-5 text-left transition-colors duration-200',
        toneClasses[tone],
        onClick && 'cursor-pointer hover:border-foreground/20',
        className,
      )}
    >
      {children}
    </Comp>
  )
}
