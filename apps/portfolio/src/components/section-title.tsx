import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Handwritten title shared by every home page section */
export default function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn('font-hand text-4xl leading-none', className)}>
      {children}
    </h2>
  );
}
