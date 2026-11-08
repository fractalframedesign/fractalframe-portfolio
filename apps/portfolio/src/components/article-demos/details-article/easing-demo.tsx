'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { Specimen } from './specimen';

const ROWS = [
  { label: 'linear', curve: 'linear' },
  { label: 'ease-out', curve: 'cubic-bezier(0.22, 1, 0.36, 1)' },
];

export function EasingDemo() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const width = trackRef.current?.offsetWidth ?? 300;
    setDist(width - 34);
    setPlaying(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)));
  };

  return (
    <Specimen
      tag="Specimen 04 · Easing"
      hint="Same distance, same duration. Different feeling."
      controls={
        <Button size="sm" variant="secondary" onClick={play}>
          Play
        </Button>
      }
    >
      <div className="flex w-full max-w-md flex-col gap-4">
        {ROWS.map((row, i) => (
          <div key={row.label} className="flex items-center gap-4">
            <span className="text-muted-foreground w-19 flex-none text-right font-mono text-xs">
              {row.label}
            </span>
            <div
              ref={i === 0 ? trackRef : undefined}
              className="bg-foreground/5 relative h-9 flex-1 rounded-full"
            >
              <div
                className="bg-primary absolute top-1 left-1 size-6 rounded-full"
                style={{
                  transform: playing ? `translateX(${dist}px)` : 'translateX(0)',
                  transition: playing ? `transform 900ms ${row.curve}` : 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Specimen>
  );
}
