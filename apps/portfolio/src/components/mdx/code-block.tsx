'use client';

import { Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ComponentPropsWithoutRef, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Pre({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'pre'>) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  const handleCopy = async () => {
    if (copied || !navigator.clipboard) return;

    const code = preRef.current?.textContent ?? '';
    await navigator.clipboard.writeText(code);
    setCopied(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-prose bigger-container">
      <div className="bg-card relative rounded-3xl border shadow-xs [&_.shiki_span]:text-[var(--shiki-light)] dark:[&_.shiki_span]:text-[var(--shiki-dark)] [&_[data-line]]:inline-block [&_[data-line]]:w-full">
        <pre
          ref={preRef}
          className={cn(
            'overflow-x-auto p-5 text-sm leading-relaxed',
            className,
          )}
          {...props}
        >
          {children}
        </pre>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={copied ? 'check' : 'copy'}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
            >
              {copied ? (
                <Check className="text-success size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}
