import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TileProps = {
  children: ReactNode
  className?: string
  tone?: 'dark' | 'violet' | 'rose'
  as?: 'div' | 'button'
  onClick?: () => void
}

const toneClasses: Record<NonNullable<TileProps['tone']>, string> = {
  dark: 'bg-tile border border-tile-border',
  violet:
    'bg-gradient-to-br from-accent-violet to-accent-violet-deep border border-accent-violet/40',
  rose: 'bg-gradient-to-br from-accent-rose to-accent-rose-deep border border-accent-rose/40',
}

export function Tile({ children, className, tone = 'dark', as = 'div', onClick }: TileProps) {
  const Comp = as as 'div'
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-[28px] p-5 text-left transition-colors duration-200',
        toneClasses[tone],
        onClick && 'cursor-pointer hover:border-white/20',
        className,
      )}
    >
      {children}
    </Comp>
  )
}
