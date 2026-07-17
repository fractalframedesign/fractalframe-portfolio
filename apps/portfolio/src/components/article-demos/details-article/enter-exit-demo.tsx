'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Specimen } from './specimen';

type ToastState = 'hidden' | 'in' | 'out';

export function EnterExitDemo() {
  const [state, setState] = useState<ToastState>('hidden');

  return (
    <Specimen
      tag="Specimen 05 · Enter vs exit"
      hint="Watch the entrance, then the exit."
      controls={
        <Button size="sm" variant="secondary" onClick={() => setState('in')}>
          Show notification
        </Button>
      }
    >
      <div
        role="status"
        className="bg-card flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-md"
        style={{
          opacity: state === 'in' ? 1 : 0,
          transform:
            state === 'in'
              ? 'translateY(0)'
              : state === 'hidden'
                ? 'translateY(10px)'
                : 'translateY(0)',
          filter: state === 'hidden' ? 'blur(4px)' : 'blur(0px)',
          pointerEvents: state === 'in' ? 'auto' : 'none',
          transition:
            state === 'in'
              ? 'opacity 250ms cubic-bezier(0.22,1,0.36,1), transform 250ms cubic-bezier(0.22,1,0.36,1), filter 250ms cubic-bezier(0.22,1,0.36,1)'
              : state === 'out'
                ? 'opacity 150ms ease'
                : 'none',
        }}
      >
        <span className="bg-success size-2 flex-none rounded-full" />
        <span>Changes saved</span>
        <button
          className="text-muted-foreground hover:text-foreground px-1 text-[13px]"
          onClick={() => setState('out')}
        >
          Dismiss
        </button>
      </div>
    </Specimen>
  );
}
