'use client';

import { Mic, Pause, Play, SendHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/components/project-demos/rakuten-link/lib/utils';

/** Voice message: timer, pulsing pink mic, Pause and Send. Nothing is really recorded. */
export function VoiceRecorder({
  recipient,
  onCancel,
  onSend,
}: {
  recipient: string;
  onCancel: () => void;
  onSend: (seconds: number) => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const tick = setTimeout(() => setSeconds((s) => s + 1), 1000);
    return () => clearTimeout(tick);
  }, [seconds, paused]);

  return (
    <div
      role="dialog"
      aria-label="Voice recording"
      className="bg-card absolute inset-0 z-10 flex flex-col"
    >
      <header className="border-border relative flex h-14 items-center justify-center border-b">
        <h2 className="text-foreground text-lg font-semibold">Voice Recording</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-secondary absolute end-4"
        >
          Cancel
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <div className="text-center">
          <p className="text-accent-foreground font-(family-name:--font-link-display) text-5xl font-light tabular-nums">
            00:{String(seconds).padStart(2, '0')}
          </p>
          <p className="text-muted-foreground mt-2">
            {paused ? 'Paused' : 'Recording…'}
          </p>
        </div>
        <span className="border-accent rounded-full border-4 p-3">
          <span
            className={cn(
              'bg-primary flex size-24 items-center justify-center rounded-full text-primary-foreground',
              !paused && 'motion-safe:animate-pulse',
            )}
          >
            <Mic aria-hidden="true" className="size-9" />
          </span>
        </span>
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          className="text-foreground flex flex-col items-center gap-2"
        >
          <span className="border-foreground flex size-14 items-center justify-center rounded-full border-2">
            {paused ? (
              <Play aria-hidden="true" className="size-5" />
            ) : (
              <Pause aria-hidden="true" className="size-5" />
            )}
          </span>
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <footer className="border-border flex items-center gap-3 border-t px-4 py-3">
        <p className="text-muted-foreground flex-1 text-center">Send to {recipient}</p>
        <button
          type="button"
          aria-label="Send voice message"
          disabled={seconds === 0}
          onClick={() => onSend(seconds)}
          className="bg-secondary flex size-12 items-center justify-center rounded-full text-primary-foreground disabled:opacity-50"
        >
          <SendHorizontal aria-hidden="true" className="size-5" />
        </button>
      </footer>
    </div>
  );
}
