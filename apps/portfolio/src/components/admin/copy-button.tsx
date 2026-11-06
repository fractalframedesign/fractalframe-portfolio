'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

type CopyButtonProps = {
  text: string;
  label: string;
  variant?: 'default' | 'outline';
};

/** Copies `text` and says "Copied" for two seconds */
export default function CopyButton({
  text,
  label,
  variant = 'outline',
}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = setTimeout(() => setState('idle'), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <Button type="button" variant={variant} onClick={copy}>
      {state === 'copied' ? <Check aria-hidden /> : <Copy aria-hidden />}
      <span aria-live="polite">
        {state === 'copied'
          ? 'Copied'
          : state === 'failed'
            ? 'Couldn’t copy. Select it instead.'
            : label}
      </span>
    </Button>
  );
}
