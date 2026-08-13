'use client';

import { Button } from '@/components/ui/button';

import { Specimen } from './specimen';

export function FocusRingsDemo() {
  return (
    <Specimen
      tag="Specimen 02 · Focus rings"
      hint="Click anywhere on this card, then press Tab to move between the two."
    >
      <Button variant="outline" className="focus-visible:[outline:auto] focus-visible:ring-0">
        Browser default
      </Button>
      <Button
        variant="outline"
        className="focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        Designed ring
      </Button>
    </Specimen>
  );
}
