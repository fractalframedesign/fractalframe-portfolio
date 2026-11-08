import { cn } from '@/components/project-demos/rakuten-link/lib/utils';

import { initials } from './data';

/** Initials avatar; Link users get the small pink "R" badge, as in the app */
export function Avatar({
  name,
  onLink = false,
  size = 'md',
  className,
}: {
  name: string;
  onLink?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-accent-2-soft text-ink-muted relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        {
          'size-8 text-xs': size === 'sm',
          'size-11 text-sm': size === 'md',
          'size-16 text-lg': size === 'lg',
          'size-28 text-3xl': size === 'xl',
        },
        className,
      )}
    >
      {initials(name)}
      {onLink && (
        <span className="bg-accent-1 ring-surface absolute -end-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full text-xs leading-none font-bold text-white ring-2">
          R
        </span>
      )}
    </span>
  );
}
