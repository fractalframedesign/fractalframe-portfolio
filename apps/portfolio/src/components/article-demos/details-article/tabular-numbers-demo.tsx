'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { Specimen } from './specimen';

function format(ms: number) {
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(Math.floor(r)).padStart(2, '0')}.${Math.floor((r % 1) * 10)}`;
}

export function TabularNumbersDemo() {
  const [running, setRunning] = useState(false);
  const [value, setValue] = useState('0:00.0');
  const raf = useRef(0);
  const start = useRef(0);

  useEffect(() => {
    if (!running) return;
    start.current = performance.now();
    const tick = () => {
      setValue(format(performance.now() - start.current));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  return (
    <Specimen
      tag="Specimen 07 · Tabular numbers"
      hint="Watch the left timer jitter around the 1s."
      controls={
        <Button size="sm" variant="secondary" onClick={() => setRunning((r) => !r)}>
          {running ? 'Stop timers' : 'Start timers'}
        </Button>
      }
    >
      <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            mode: 'Proportional',
            cls: '[font-variant-numeric:normal]',
            style: { fontFamily: 'Georgia, serif' },
            cap: 'digits shift as they change',
          },
          {
            mode: 'Tabular',
            cls: 'tabular-nums',
            style: undefined,
            cap: 'every digit, same width',
          },
        ].map(({ mode, cls, style, cap }) => (
          <div
            key={mode}
            className="bg-card rounded-xl border p-4 text-center shadow-xs"
          >
            <p className="text-muted-foreground mb-2 font-mono text-[10px] tracking-[0.12em] uppercase">
              {mode}
            </p>
            <p className={`text-3xl font-semibold tracking-tight ${cls}`} style={style}>
              {value}
            </p>
            <p className="text-muted-foreground mt-1.5 text-xs">{cap}</p>
          </div>
        ))}
      </div>
    </Specimen>
  );
}
