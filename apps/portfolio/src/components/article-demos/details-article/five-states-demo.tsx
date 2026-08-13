'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Specimen } from './specimen';

export function FiveStatesDemo() {
  const [disabled, setDisabled] = useState(false);
  return (
    <Specimen
      tag="Specimen 01 · Five states"
      hint="Hover it. Press and hold it. Tab to it."
      controls={
        <span className="flex items-center gap-2">
          <Switch id="d1-disabled" checked={disabled} onCheckedChange={setDisabled} />
          <Label htmlFor="d1-disabled" className="text-muted-foreground text-[13px] font-normal">
            Disabled state
          </Label>
        </span>
      }
    >
      <Button
        size="lg"
        disabled={disabled}
        className="transition-[background-color,transform] duration-150 active:scale-[0.98]"
      >
        Save changes
      </Button>
    </Specimen>
  );
}
