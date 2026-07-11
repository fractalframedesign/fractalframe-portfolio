'use client';

import { motion } from 'motion/react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getStackItems } from '@/lib/stack';
import { cn } from '@/lib/utils';

interface StackGridProps {
  stack: string[];
  title?: string;
  className?: string;
}

export function StackGrid({
  stack,
  title = 'My stack',
  className,
}: StackGridProps) {
  const stackItems = getStackItems(stack);
  const doubled = [...stackItems, ...stackItems];

  return (
    <section
      className={cn('section-padding bigger-container space-y-10', className)}
    >
      <motion.h2
        className="container text-2xl leading-none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {title}
      </motion.h2>

      <div className="relative overflow-hidden">
        <div className="from-background pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-linear-to-r to-transparent" />
        <div className="from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-linear-to-l to-transparent" />

        <motion.ul
          className="flex gap-4"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
        >
          {doubled.map((item, i) => {
            const Icon = item.Icon;
            return (
              <Tooltip key={`${item.name}-${i}`}>
                <TooltipTrigger asChild>
                  <motion.li
                    className={cn(
                      'group flex size-25 shrink-0 cursor-default list-none items-center justify-center rounded-3xl',
                      item.lightSrc ? 'overflow-hidden' : 'bg-muted',
                    )}
                    style={{ '--brand-color': item.color } as React.CSSProperties}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  >
                    {item.lightSrc && item.darkSrc ? (
                      <>
                        <img
                          src={item.lightSrc}
                          alt={item.name}
                          className="size-full dark:hidden"
                        />
                        <img
                          src={item.darkSrc}
                          alt={item.name}
                          className="hidden size-full dark:block"
                        />
                      </>
                    ) : Icon ? (
                      <Icon className="text-muted-foreground size-9 transition-colors group-hover:text-(--brand-color)" />
                    ) : null}
                  </motion.li>
                </TooltipTrigger>
                <TooltipContent side="bottom">{item.name}</TooltipContent>
              </Tooltip>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
