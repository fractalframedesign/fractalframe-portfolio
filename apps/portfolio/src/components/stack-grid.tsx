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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};

const tileVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const },
  },
};

export function StackGrid({
  stack,
  title = 'My stack',
  className,
}: StackGridProps) {
  const stackItems = getStackItems(stack);

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

      <motion.ul
        className="flex flex-wrap items-center gap-4.25 lg:justify-between"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {stackItems.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <motion.li
                variants={tileVariants}
                className="group bg-muted flex size-25 shrink-0 items-center justify-center rounded-3xl"
                style={{ '--brand-color': item.color } as React.CSSProperties}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <item.Icon
                  className="text-muted-foreground size-9 transition-colors group-hover:text-(--brand-color)"
                />
              </motion.li>
            </TooltipTrigger>
            <TooltipContent side="bottom">{item.name}</TooltipContent>
          </Tooltip>
        ))}
      </motion.ul>
    </section>
  );
}
