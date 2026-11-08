'use client';

import {
  ChevronDown,
  Grid3x3,
  MessageSquareMore,
  MicOff,
  PhoneOff,
  Volume2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/components/project-demos/rakuten-link/lib/utils';

import { Avatar } from './Avatar';

const ControlButton = ({
  label,
  icon: Icon,
  pressed,
  onClick,
}: {
  label: string;
  icon: typeof MicOff;
  pressed?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    onClick={onClick}
    className="group flex flex-col items-center gap-2 outline-none"
  >
    <span
      className={cn(
        'flex size-16 items-center justify-center rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-white',
        pressed ? 'bg-white text-accent-3' : 'bg-white/10 text-white',
      )}
    >
      <Icon aria-hidden="true" className="size-6" />
    </span>
    <span className="text-sm text-white" aria-hidden="true">
      {label}
    </span>
  </button>
);

/** Full-screen call, as in the app: "Calling via Rakuten Link", then a running timer */
export function CallScreen({
  name,
  phone,
  onEnd,
  className,
}: {
  name: string;
  phone: string;
  onEnd: () => void;
  className?: string;
}) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [seconds, setSeconds] = useState<number | null>(null);

  // Simulated: the other side "answers" after two seconds
  useEffect(() => {
    const answer = setTimeout(() => setSeconds(0), 2000);
    return () => clearTimeout(answer);
  }, []);
  useEffect(() => {
    if (seconds === null) return;
    const tick = setTimeout(() => setSeconds(seconds + 1), 1000);
    return () => clearTimeout(tick);
  }, [seconds]);

  const timer =
    seconds === null
      ? null
      : `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div
      role="dialog"
      aria-label={`Call with ${name}`}
      className={cn(
        'from-accent-3 to-accent-3-deep absolute inset-0 z-20 flex flex-col items-center bg-linear-to-b px-6 pt-12 pb-10 text-white',
        className,
      )}
    >
      <ChevronDown
        aria-hidden="true"
        className="absolute start-5 top-12 size-8 rounded-full bg-white p-2 text-accent-3"
      />
      <p className="font-(family-name:--font-link-display) text-2xl font-medium">
        {name}
      </p>
      <p className="font-(family-name:--font-link-display) mt-2 font-light text-white/80 tabular-nums">
        {phone}
      </p>
      <p className="mt-2" aria-live="polite">
        {timer ?? (
          <>
            Calling via <span className="text-accent-1">Rakuten Link</span>
          </>
        )}
      </p>

      <span className="mt-16 flex flex-1 items-start justify-center">
        <span
          className={cn(
            'rounded-full bg-white/15 p-5',
            timer === null && 'motion-safe:animate-pulse',
          )}
        >
          <Avatar name={name} size="xl" className="ring-accent-3 ring-2" />
        </span>
      </span>

      <div className="grid w-full grid-cols-3 gap-y-6">
        <ControlButton
          label="Mute"
          icon={MicOff}
          pressed={muted}
          onClick={() => setMuted(!muted)}
        />
        <ControlButton label="Message" icon={MessageSquareMore} />
        <ControlButton
          label="Audio"
          icon={Volume2}
          pressed={speaker}
          onClick={() => setSpeaker(!speaker)}
        />
        <span />
        <button
          type="button"
          aria-label="End call"
          onClick={onEnd}
          className="bg-destructive mx-auto flex size-16 items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        >
          <PhoneOff aria-hidden="true" className="size-7" />
        </button>
        <ControlButton label="Keypad" icon={Grid3x3} />
      </div>
    </div>
  );
}
