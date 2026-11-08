'use client';

import { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { Specimen } from './specimen';

export function ConcentricRadiiDemo() {
  const [concentric, setConcentric] = useState(false);

  return (
    <Specimen
      tag="Specimen 12 · Concentric radii"
      hint="Outer 24 → padding 10 → inner 14."
      controls={
        <ToggleGroup
          type="single"
          size="sm"
          value={concentric ? 'con' : 'mis'}
          onValueChange={(v) => v && setConcentric(v === 'con')}
        >
          <ToggleGroupItem value="mis">Mismatched</ToggleGroupItem>
          <ToggleGroupItem value="con">Concentric</ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <div className="bg-card w-full max-w-85 rounded-3xl border p-3 shadow-xs">
        <div
          className="from-primary to-primary/60 flex h-28 items-end bg-gradient-to-r p-3 transition-[border-radius] duration-250"
          style={{ borderRadius: concentric ? 14 : 24 }}
        >
          <span className="text-primary-foreground/85 font-mono text-xs tracking-wider">
            {concentric ? 'INNER 14 = OUTER 24 − PADDING · CONCENTRIC' : 'INNER 24 = OUTER 24 · MISMATCHED'}
          </span>
        </div>
      </div>
    </Specimen>
  );
}
