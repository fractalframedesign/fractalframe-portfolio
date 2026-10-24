'use client';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { LOCATION } from '@/lib/constants';
import { cn } from '@/lib/utils';

const formatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: LOCATION.timeZone,
});

/** Pill showing where I am and the current time there, updated every minute. */
export const LocalTime = ({ className }: { className?: string }) => {
  // Empty until mounted so the server and client render the same markup
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = setInterval(tick, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Badge
      variant="outline"
      className={cn('bg-background gap-2 rounded-full px-3 py-1', className)}
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span className="bg-success absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping" />
        <span className="bg-success relative inline-flex size-2 rounded-full" />
      </span>
      <span>{LOCATION.label}</span>
      <span className="text-muted-foreground" aria-hidden="true">
        ·
      </span>
      <span className="text-muted-foreground">
        Local time{' '}
        <time
          dateTime={now?.toISOString()}
          className="text-foreground tabular-nums"
        >
          {now ? formatter.format(now) : '--:--'}
        </time>
      </span>
    </Badge>
  );
};
