'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

const ITEMS = [
  {
    title: 'Audit your components',
    detail: 'do they share structural logic, or just visual style?',
  },
  {
    title: 'Check your grids',
    detail: 'does your spacing system scale predictably from micro to macro?',
  },
  {
    title: 'Review your navigation',
    detail: 'does the top-level structure mirror the detail-level structure?',
  },
  {
    title: 'Zoom your data views',
    detail: 'does zooming in or out feel like the same interface at a different scale?',
  },
];

export function FractalAuditDemo() {
  const [done, setDone] = useState<boolean[]>(ITEMS.map(() => false));
  const doneCount = done.filter(Boolean).length;

  function toggle(index: number) {
    setDone((prev) => prev.map((d, i) => (i === index ? !d : d)));
  }

  return (
    <div className="not-prose container">
      <div className="my-8 space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-lg">The fractal audit</h3>
          <span className="text-muted-foreground font-mono text-xs tracking-[0.08em]">
            <span className="text-foreground">{doneCount}</span> / {ITEMS.length} audited
          </span>
        </div>
        <ul className="overflow-hidden rounded-2xl border">
          {ITEMS.map((item, i) => (
            <li key={item.title} className="border-b last:border-b-0">
              <button
                type="button"
                role="checkbox"
                aria-checked={done[i]}
                onClick={() => toggle(i)}
                className="hover:bg-muted/50 flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition-colors"
              >
                <span
                  className={cn(
                    'flex size-6.5 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] transition-colors',
                    done[i]
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : 'text-muted-foreground bg-muted',
                  )}
                >
                  {done[i] ? '✓' : `0${i + 1}`}
                </span>
                <span
                  className={cn(
                    'text-[15px] leading-relaxed transition-opacity',
                    done[i] && 'text-muted-foreground line-through opacity-60',
                  )}
                >
                  <strong className="text-foreground font-semibold">{item.title}</strong>{' '}
                  — {item.detail}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p
          className={cn(
            'text-muted-foreground text-sm italic transition-opacity duration-300',
            doneCount === ITEMS.length ? 'opacity-100' : 'opacity-0',
          )}
        >
          All four? Either your system is already fractal — or you just found
          Monday&apos;s roadmap. ✦
        </p>
      </div>
    </div>
  );
}
