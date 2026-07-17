'use client';

import { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { Specimen } from './specimen';

export function BorderShadowDemo() {
  const [mode, setMode] = useState<'border' | 'shadow'>('border');

  return (
    <Specimen
      tag="Specimen 10 · Border vs shadow"
      hint="A solid border fights this background. Transparency adapts to it."
      stageClassName="bg-[linear-gradient(160deg,#1B2B57_0%,#3D5AA9_60%,#93A9E8_100%)]"
      controls={
        <ToggleGroup
          type="single"
          size="sm"
          value={mode}
          onValueChange={(v) => v && setMode(v as 'border' | 'shadow')}
        >
          <ToggleGroupItem value="border">Border</ToggleGroupItem>
          <ToggleGroupItem value="shadow">Shadow</ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <div
        className={`w-full max-w-xs rounded-xl bg-white p-5 transition-[box-shadow,border-color] duration-200 ${
          mode === 'border'
            ? 'border border-[#C9CFDA] shadow-none'
            : 'border border-transparent shadow-[0_0_0_1px_rgba(10,16,38,0.10),0_2px_6px_-2px_rgba(10,16,38,0.25),0_8px_24px_-6px_rgba(10,16,38,0.28)]'
        }`}
      >
        <p className="mb-1 text-sm font-semibold text-neutral-900">Team workspace</p>
        <p className="text-xs text-neutral-500">8 members · Updated 2 hours ago</p>
      </div>
    </Specimen>
  );
}
