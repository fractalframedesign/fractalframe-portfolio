'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'relative flex size-9 shrink-0 overflow-hidden rounded-full bg-muted',
        className,
      )}
      {...props}
    />
  )
}

export function AvatarImage({ className, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} className={cn('aspect-square size-full object-cover', className)} {...props} />
}

export function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}
