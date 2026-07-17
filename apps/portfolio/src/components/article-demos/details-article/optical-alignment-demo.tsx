'use client';

import { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { Specimen } from './specimen';

export function OpticalAlignmentDemo() {
  const [optical, setOptical] = useState(false);

  return (
    <Specimen
      tag="Specimen 11 · Optical alignment"
      hint="The optical version nudges the triangle 3px right. Toggle and trust your eye."
      controls={
        <ToggleGroup
          type="single"
          size="sm"
          value={optical ? 'opt' : 'geo'}
          onValueChange={(v) => v && setOptical(v === 'opt')}
        >
          <ToggleGroupItem value="geo">Geometric</ToggleGroupItem>
          <ToggleGroupItem value="opt">Optical</ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <button
        aria-label="Play"
        className="bg-foreground text-background flex size-[76px] items-center justify-center rounded-full transition-transform active:scale-[0.97]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-[26px] transition-transform duration-200"
          style={{ transform: optical ? 'translateX(3px)' : 'translateX(0)' }}
        >
          <path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.3-7.2c.6-.4.6-1.4 0-1.8L8.6 3.9c-.7-.4-1.6.1-1.6.9z" />
        </svg>
      </button>
    </Specimen>
  );
}
