'use client'

import { motion } from 'motion/react'
import * as React from 'react'

import { useMotion } from '@/components/project-demos/fintech-components/motion/settings'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  /** Unique per Tabs, so each tab list's sliding pill stays in its own list */
  id: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const current = isControlled ? value : internal
  const id = React.useId()

  function setValue(next: string) {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ value: current, setValue, id }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-1 rounded-lg bg-muted p-1', className)}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(TabsContext)
  const m = useMotion()
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')
  const active = ctx.value === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'relative rounded-md px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? cn('text-foreground', !m.enabled && 'bg-card shadow-sm')
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {/* With studio motion on, the active pill slides between tabs instead of jumping */}
      {m.enabled && active && (
        <motion.span
          layoutId={`tabs-pill-${ctx.id}`}
          className="absolute inset-0 rounded-md bg-card shadow-sm"
          transition={m.spring(320)}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(TabsContext)
  const m = useMotion()
  if (!ctx) throw new Error('TabsContent must be used within Tabs')
  if (ctx.value !== value) return null
  if (!m.enabled) {
    return (
      <div role="tabpanel" className={className}>
        {children}
      </div>
    )
  }
  return (
    <motion.div
      role="tabpanel"
      className={className}
      initial={{ opacity: 0, y: m.distance / 2, filter: `blur(${m.blur}px)` }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={m.tween(280)}
    >
      {children}
    </motion.div>
  )
}
