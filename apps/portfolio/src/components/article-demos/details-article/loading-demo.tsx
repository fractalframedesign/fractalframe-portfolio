'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { Specimen } from './specimen';

function LoadedContent() {
  return (
    <div className="animate-in fade-in duration-300">
      <p className="mb-1.5 text-sm font-semibold">Q3 revenue summary</p>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Revenue grew 12% quarter over quarter, driven by activation gains.
      </p>
    </div>
  );
}

export function LoadingDemo() {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const run = () => {
    clearTimeout(timer.current);
    setDone(false);
    timer.current = setTimeout(() => setDone(true), 1700);
  };

  useEffect(() => {
    timer.current = setTimeout(() => setDone(true), 1700);
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <Specimen
      tag="Specimen 06 · Perceived speed"
      hint="Identical load time. Which one felt shorter?"
      controls={
        <Button size="sm" variant="secondary" onClick={run}>
          Reload both
        </Button>
      }
    >
      <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-card relative min-h-37 rounded-xl border p-4 shadow-xs">
          <p className="text-muted-foreground mb-3 font-mono text-[10px] tracking-[0.12em] uppercase">
            Spinner
          </p>
          {done ? (
            <LoadedContent />
          ) : (
            <div className="border-foreground/10 border-t-foreground absolute top-[58%] left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-[2.5px]" />
          )}
        </div>
        <div className="bg-card min-h-37 rounded-xl border p-4 shadow-xs">
          <p className="text-muted-foreground mb-3 font-mono text-[10px] tracking-[0.12em] uppercase">
            Skeleton
          </p>
          {done ? (
            <LoadedContent />
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="bg-foreground/10 h-3.5 w-[70%] rounded-md" />
              <div className="bg-foreground/10 h-2.5 w-full rounded-md" />
              <div className="bg-foreground/10 h-2.5 w-[86%] rounded-md" />
            </div>
          )}
        </div>
      </div>
    </Specimen>
  );
}
