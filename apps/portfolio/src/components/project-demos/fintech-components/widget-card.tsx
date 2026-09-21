'use client'

import { Code2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

import { CodeBlock } from '@/components/project-demos/fintech-components/code-block'
import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { cn } from '@/lib/utils'

export function WidgetCard({
  id,
  name,
  code,
  children,
}: {
  id?: string
  name: string
  code: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div id={id} className="mx-auto flex max-w-[480px] scroll-mt-24 flex-col gap-3">
      <motion.div
        className="overflow-x-auto"
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {children}
      </motion.div>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground">{name}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          className={cn('gap-1.5 rounded-full text-xs', open && 'border-primary/40 bg-primary/10 text-primary')}
          aria-expanded={open}
        >
          <motion.span
            className="flex items-center"
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          >
            <Code2 className="size-3.5" />
          </motion.span>
          {open ? 'Hide code' : 'Show code'}
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="code"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <CodeBlock code={code} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
