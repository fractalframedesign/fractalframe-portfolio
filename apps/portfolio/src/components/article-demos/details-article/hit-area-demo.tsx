'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Specimen } from './specimen';

export function HitAreaDemo() {
  const [reveal, setReveal] = useState(false);
  return (
    <Specimen
      tag="Specimen 03 · Hit area"
      hint="The icon is 16px. The target is 44px."
      controls={
        <span className="flex items-center gap-2">
          <Switch id="d3-reveal" checked={reveal} onCheckedChange={setReveal} />
          <Label htmlFor="d3-reveal" className="text-muted-foreground text-[13px] font-normal">
            Reveal hit area
          </Label>
        </span>
      }
    >
      <div className="bg-card flex items-center gap-7 rounded-xl border px-5 py-4 text-sm shadow-xs">
        <span>Weekly report is ready</span>
        <button
          aria-label="Dismiss"
          className={`text-muted-foreground hover:text-foreground -m-3.5 rounded-xl p-3.5 transition-colors ${
            reveal ? 'bg-primary/10 shadow-[inset_0_0_0_1.5px_var(--primary)]' : ''
          }`}
        >
          <X className="size-4" />
        </button>
      </div>
    </Specimen>
  );
}
