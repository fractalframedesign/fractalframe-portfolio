'use client';

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

  return (
    <section
      className={cn('section-padding bigger-container space-y-10', className)}
    >
      <h2 className="container text-2xl leading-none">{title}</h2>
      <ul
        className={cn(
          'flex flex-wrap items-center gap-4.25 lg:justify-between',
        )}
      >
        {stackItems.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <li
                className={cn(
                  'group bg-muted flex size-25 shrink-0 items-center justify-center rounded-3xl',
                )}
                style={{ '--brand-color': item.color } as React.CSSProperties}
              >
                <item.Icon
                  className={cn(
                    'text-muted-foreground size-9 transition-colors group-hover:text-[var(--brand-color)]',
                  )}
                />
              </li>
            </TooltipTrigger>
            <TooltipContent side="bottom">{item.name}</TooltipContent>
          </Tooltip>
        ))}
      </ul>
    </section>
  );
}
