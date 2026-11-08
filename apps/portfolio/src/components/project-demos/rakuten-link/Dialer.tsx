'use client';

import { Delete, Phone } from 'lucide-react';
import { useState } from 'react';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

/** Keypad: grey round keys and a big pink call button */
export function Dialer({
  onCall,
  onClose,
}: {
  onCall: (number: string) => void;
  onClose: () => void;
}) {
  const [number, setNumber] = useState('');

  return (
    <div className="bg-card absolute inset-0 z-10 flex flex-col items-center px-8 pt-16 pb-10">
      <p
        aria-label="Number"
        aria-live="polite"
        className="text-foreground font-(family-name:--font-link-display) flex h-12 items-center gap-2 text-3xl tracking-wide tabular-nums"
      >
        {number}
        {!number && (
          <span
            aria-hidden="true"
            className="bg-primary h-9 w-0.5 motion-safe:animate-pulse"
          />
        )}
      </p>

      <div className="mt-10 grid grid-cols-3 gap-x-6 gap-y-4">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key}
            onClick={() => setNumber((n) => n + key)}
            className="bg-muted text-foreground font-(family-name:--font-link-display) focus-visible:ring-primary flex size-18 flex-col items-center justify-center rounded-full text-3xl outline-none active:scale-96 focus-visible:ring-2"
          >
            {key}
            {key === '0' && <span className="text-xs leading-none">+</span>}
          </button>
        ))}
      </div>

      <div className="mt-8 grid w-full grid-cols-3 items-center">
        <button
          type="button"
          onClick={onClose}
          className="text-secondary justify-self-center text-lg"
        >
          Close
        </button>
        <button
          type="button"
          aria-label="Call number"
          disabled={!number}
          onClick={() => onCall(number)}
          className="bg-primary focus-visible:ring-primary flex size-18 items-center justify-center justify-self-center rounded-full text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          <Phone aria-hidden="true" className="size-8 fill-current" />
        </button>
        {number && (
          <button
            type="button"
            aria-label="Delete digit"
            onClick={() => setNumber((n) => n.slice(0, -1))}
            className="text-muted-foreground justify-self-center"
          >
            <Delete aria-hidden="true" className="size-6" />
          </button>
        )}
      </div>
    </div>
  );
}
