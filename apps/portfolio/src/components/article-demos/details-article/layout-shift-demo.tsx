'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { Specimen } from './specimen';

const BANNER = 'rounded-lg bg-gradient-to-r from-[#2E5BE6] via-[#7BA0FF] to-[#BFD2FF]';

export function LayoutShiftDemo() {
  const [arrived, setArrived] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const run = () => {
    clearTimeout(timer.current);
    setArrived(false);
    timer.current = setTimeout(() => setArrived(true), 1200);
  };

  useEffect(() => {
    timer.current = setTimeout(() => setArrived(true), 1200);
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <Specimen
      tag="Specimen 08 · Layout shift"
      hint='Try to click "Continue" on the left before the image loads.'
      controls={
        <Button size="sm" variant="secondary" onClick={run}>
          Reload both
        </Button>
      }
    >
      <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-card rounded-xl border p-4 shadow-xs">
          <p className="text-muted-foreground mb-2.5 font-mono text-[10px] tracking-[0.12em] uppercase">
            No reserved space
          </p>
          <div
            className={`${BANNER} transition-[height] duration-250`}
            style={{ height: arrived ? 64 : 0 }}
          />
          <p className="text-muted-foreground my-2.5 text-xs">
            Your workspace is ready to share with the team.
          </p>
          <Button size="sm" variant="outline">
            Continue
          </Button>
        </div>
        <div className="bg-card rounded-xl border p-4 shadow-xs">
          <p className="text-muted-foreground mb-2.5 font-mono text-[10px] tracking-[0.12em] uppercase">
            Reserved space
          </p>
          <div className="bg-foreground/5 h-16 overflow-hidden rounded-lg">
            <div
              className={`${BANNER} h-16 transition-opacity duration-300`}
              style={{ opacity: arrived ? 1 : 0 }}
            />
          </div>
          <p className="text-muted-foreground my-2.5 text-xs">
            Your workspace is ready to share with the team.
          </p>
          <Button size="sm" variant="outline">
            Continue
          </Button>
        </div>
      </div>
    </Specimen>
  );
}
