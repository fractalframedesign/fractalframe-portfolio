'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { Specimen } from './specimen';

const VARIANTS = {
  before: {
    title: 'Something went wrong',
    body: 'Please try again later.',
    action: 'OK',
  },
  after: {
    title: "Your changes couldn't be saved",
    body: "You're offline right now. We've kept your edits and will retry automatically when you reconnect.",
    action: 'Retry now',
  },
} as const;

export function ErrorCopyDemo() {
  const [variant, setVariant] = useState<keyof typeof VARIANTS>('before');
  const v = VARIANTS[variant];

  return (
    <Specimen
      tag="Specimen 09 · Error copy"
      hint="Same failure, rewritten."
      controls={
        <ToggleGroup
          type="single"
          size="sm"
          value={variant}
          onValueChange={(val) => val && setVariant(val as keyof typeof VARIANTS)}
        >
          <ToggleGroupItem value="before">Before</ToggleGroupItem>
          <ToggleGroupItem value="after">After</ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <div className="bg-card w-full max-w-sm rounded-xl border p-5 shadow-xs">
        <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
          <span className="bg-destructive size-2 flex-none rounded-full" />
          {v.title}
        </p>
        <p className="text-muted-foreground text-[13.5px] leading-relaxed">{v.body}</p>
        <Button size="sm" variant="outline" className="mt-3">
          {v.action}
        </Button>
      </div>
    </Specimen>
  );
}
