'use client';

import '@/components/project-demos/rakuten-link/theme.css';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Mic,
  MousePointer2,
  PhoneOff,
  Video,
} from 'lucide-react';
import { motion } from 'motion/react';
import { type KeyboardEvent, useState } from 'react';

import { linkFonts } from '@/components/project-demos/rakuten-link/fonts';
import { cn } from '@/lib/utils';

/* ---------- small drawing parts ---------- */

const Lines = ({ widths }: { widths: string[] }) => (
  <span className="block space-y-2">
    {widths.map((w, i) => (
      <span key={i} className={cn('bg-ink/15 block h-1 rounded-full', w)} />
    ))}
  </span>
);

const Pin = ({ n, className }: { n: number; className?: string }) => (
  <span
    className={cn(
      'bg-accent-1 ring-surface absolute flex size-6 items-center justify-center rounded-full rounded-bl-none text-xs font-bold text-white shadow ring-2',
      className,
    )}
  >
    {n}
  </span>
);

const MiniScreen = ({
  className,
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) => (
  <span
    className={cn(
      'border-ink/20 block w-full rounded-xl border-2 p-2',
      dark ? 'bg-accent-3' : 'bg-surface',
      className,
    )}
  >
    <span className="bg-accent-1 block h-1 w-1/2 rounded-full" />
    <span className="mt-2 block space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            'block h-2 rounded',
            dark ? 'bg-white/15' : 'bg-accent-2-soft',
          )}
        />
      ))}
    </span>
  </span>
);

const Cursor = ({
  label,
  tone,
  className,
  drift,
}: {
  label: string;
  tone: string;
  className?: string;
  drift: { x: number[]; y: number[] };
}) => (
  <motion.span
    className={cn('absolute flex items-start', className)}
    animate={drift}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
  >
    <MousePointer2
      aria-hidden="true"
      className={cn('size-4 fill-current', tone)}
    />
    <span
      className={cn(
        'mt-3 rounded-full px-2 py-1 text-xs font-semibold text-white',
        tone.replace('text-', 'bg-'),
      )}
    >
      {label}
    </span>
  </motion.span>
);

/* ---------- the four scenes ---------- */

// A wall of screen drafts with notes and comment pins, like a big design canvas
const DRAFTS = Array.from({ length: 15 }, (_, i) => i);

const CanvasScene = () => (
  <div className="bg-canvas relative flex size-full gap-[3%] overflow-hidden bg-[radial-gradient(color-mix(in_oklch,var(--color-ink)_18%,transparent)_1px,transparent_1px)] bg-size-[16px_16px] p-[4%]">
    <ul className="grid flex-1 grid-cols-5 grid-rows-3 gap-[4%]">
      {DRAFTS.map((i) => (
        <li key={i} className="relative">
          <MiniScreen className="h-full" dark={i === 2 || i === 11} />
          {[0, 3, 7, 9, 13].includes(i) && (
            <Pin
              n={[0, 3, 7, 9, 13].indexOf(i) + 1}
              className="-top-2 -right-2"
            />
          )}
        </li>
      ))}
    </ul>
    <div className="relative w-[24%] space-y-4 self-center">
      {[
        {
          tone: 'bg-accent-4',
          w: ['w-full', 'w-3/4', 'w-1/2'],
          tilt: '-rotate-2',
        },
        {
          tone: 'bg-accent-1-soft',
          w: ['w-5/6', 'w-full', 'w-2/3'],
          tilt: 'rotate-2',
        },
        { tone: 'bg-accent-2-soft', w: ['w-full', 'w-1/2'], tilt: '-rotate-1' },
      ].map((note) => (
        <span
          key={note.tone}
          className={cn('block rounded-sm p-3 shadow-sm', note.tone, note.tilt)}
        >
          <Lines widths={note.w} />
        </span>
      ))}
      <span className="bg-surface border-surface-border block rounded-xl border p-3 text-left shadow-lg">
        <span className="text-ink flex items-center gap-2 text-xs font-semibold">
          <MessageCircle aria-hidden="true" className="size-4" /> Brand
        </span>
        <span className="text-ink-muted mt-1 block text-xs leading-snug">
          Pink only for calling. Can we keep it off the chat screens?
        </span>
      </span>
    </div>
  </div>
);

const DesignToolScene = () => (
  <div className="bg-surface flex size-full overflow-hidden">
    <span className="border-surface-border hidden w-[18%] border-e p-3 sm:block">
      <Lines widths={['w-3/4', 'w-1/2', 'w-2/3', 'w-1/2', 'w-3/4', 'w-1/3']} />
    </span>
    <span className="bg-canvas relative flex flex-1 items-center justify-center gap-6">
      <span className="border-ink bg-surface relative block h-[78%] w-[22%] min-w-24 rounded-2xl border-4 p-2">
        <span className="bg-accent-1 block h-2 w-1/3 rounded-full" />
        <span className="mt-3 block space-y-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="bg-accent-2-soft block size-4 shrink-0 rounded-full" />
              <span className="bg-ink/15 block h-1 flex-1 rounded-full" />
              <span className="bg-accent-1 block size-2 rounded-full" />
            </span>
          ))}
        </span>
        <Pin n={5} className="top-[30%] -right-3" />
      </span>
      <span className="border-ink bg-accent-3 relative hidden h-[78%] w-[22%] min-w-24 rounded-2xl border-4 sm:block">
        <span className="mx-auto mt-[40%] block size-10 rounded-full bg-white/20" />
        <span className="bg-destructive mx-auto mt-[60%] block size-6 rounded-full" />
        <Pin n={6} className="bottom-[14%] -left-3" />
      </span>
      <Cursor
        label="PM"
        tone="text-accent-2"
        className="top-[18%] left-[18%]"
        drift={{ x: [0, 40, 10, 0], y: [0, 20, 50, 0] }}
      />
      <Cursor
        label="Brand"
        tone="text-accent-1"
        className="top-[60%] left-[30%]"
        drift={{ x: [0, -20, 30, 0], y: [0, -30, -10, 0] }}
      />
      <Cursor
        label="Eng"
        tone="text-accent-3"
        className="top-[30%] right-[22%]"
        drift={{ x: [0, 25, -15, 0], y: [0, 35, 10, 0] }}
      />
      <Cursor
        label="Kiran"
        tone="text-success"
        className="right-[34%] bottom-[16%]"
        drift={{ x: [0, -30, -10, 0], y: [0, -15, -40, 0] }}
      />
    </span>
    <span className="border-surface-border w-[26%] space-y-3 border-s p-3 max-sm:hidden">
      {[
        {
          who: 'PM',
          text: 'Free calls need to be the first thing people see.',
        },
        { who: 'Eng', text: 'Desktop can reuse the same chat bubble.' },
        { who: 'Kiran', text: 'Updated: one call button size across apps.' },
      ].map((c) => (
        <span key={c.who} className="bg-canvas block rounded-lg p-2">
          <span className="text-ink block text-xs font-semibold">
            {c.who}
          </span>
          <span className="text-ink-muted block text-xs leading-snug">
            {c.text}
          </span>
        </span>
      ))}
    </span>
  </div>
);

const CallScene = () => (
  <div className="bg-accent-3-deep flex size-full flex-col gap-2 p-3">
    <span className="grid flex-1 grid-cols-3 grid-rows-2 gap-2">
      <span className="bg-surface relative col-span-2 row-span-2 rounded-xl p-3">
        <span className="text-ink-muted block text-xs">
          Kiran is sharing a screen
        </span>
        <span className="mt-2 flex h-[80%] items-center justify-center gap-3">
          <span className="w-24">
            <MiniScreen />
          </span>
          <span className="w-24">
            <MiniScreen dark />
          </span>
        </span>
      </span>
      {['PM', 'Brand', 'Eng', 'Biz'].slice(0, 2).map((who) => (
        <span
          key={who}
          className="bg-accent-3 relative flex items-center justify-center rounded-xl"
        >
          <span className="bg-accent-2-soft text-ink flex size-10 items-center justify-center rounded-full text-xs font-bold">
            {who}
          </span>
        </span>
      ))}
    </span>
    <span className="grid grid-cols-4 gap-2">
      {['Eng', 'Biz', 'QA', 'Legal'].map((who) => (
        <span
          key={who}
          className="bg-accent-3 flex h-12 items-center justify-center rounded-lg"
        >
          <span className="bg-accent-2-soft text-ink flex size-7 items-center justify-center rounded-full text-xs font-bold">
            {who}
          </span>
        </span>
      ))}
    </span>
    <span className="flex justify-center gap-3 pt-1" aria-hidden="true">
      <span className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white">
        <Mic className="size-4" />
      </span>
      <span className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white">
        <Video className="size-4" />
      </span>
      <span className="bg-destructive flex size-8 items-center justify-center rounded-full text-white">
        <PhoneOff className="size-4" />
      </span>
    </span>
  </div>
);

// One SVG, so boxes and arrows stay joined at every size
const FLOW_BOXES = [
  { label: 'Splash', x: 20, y: 50 },
  { label: 'Calls', x: 120, y: 50 },
  { label: 'Chat', x: 220, y: 50 },
  { label: 'Call', x: 320, y: 50 },
  { label: 'Keypad', x: 70, y: 150 },
  { label: 'SMS hand-off', x: 196, y: 150, w: 92, dashed: true },
];

const WhiteboardScene = () => (
  <div className="bg-surface size-full">
    <svg
      aria-hidden="true"
      viewBox="0 0 410 225"
      className="text-ink size-full"
      fill="none"
    >
      <defs>
        <marker
          id="flow-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 z" fill="currentColor" />
        </marker>
      </defs>
      <g
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        markerEnd="url(#flow-arrow)"
        opacity="0.7"
      >
        <path d="M84 66 H118" />
        <path d="M184 66 H218" />
        <path d="M284 66 H318" />
        <path d="M152 82 C 152 115, 102 115, 102 148" />
        <path d="M252 82 C 252 115, 242 115, 242 148" />
      </g>
      {FLOW_BOXES.map(({ label, x, y, w = 64, dashed }) => (
        <g key={label}>
          <rect
            x={x}
            y={y}
            width={w}
            height={32}
            rx={7}
            className="fill-surface"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray={dashed ? '4 3' : undefined}
          />
          <text
            x={x + w / 2}
            y={y + 20}
            textAnchor="middle"
            className="fill-ink text-xs font-semibold"
          >
            {label}
          </text>
        </g>
      ))}
      <g transform="rotate(4 345 175)">
        <rect
          x="306"
          y="146"
          width="90"
          height="50"
          rx="2"
          className="fill-accent-1-soft"
        />
        <text x="318" y="166" className="fill-ink text-xs">
          Not on Link?
        </text>
        <text x="318" y="178" className="fill-ink text-xs">
          Send them to SMS.
        </text>
      </g>
    </svg>
  </div>
);

const SLIDES = [
  { caption: 'A big canvas full of comments', Scene: CanvasScene },
  { caption: 'Comments and cursors on every screen', Scene: DesignToolScene },
  { caption: 'Calls with everyone, again and again', Scene: CallScene },
  { caption: 'Whiteboarding the UI flows', Scene: WhiteboardScene },
];

/** The work between the first idea and launch, as a slideshow of illustrated scenes */
export default function RakutenLinkProcess() {
  const [index, setIndex] = useState(0);
  const go = (next: number) => setIndex((next + SLIDES.length) % SLIDES.length);
  const { caption, Scene } = SLIDES[index];

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(index + 1);
    if (event.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <section
      aria-labelledby="endless-iterations"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="space-y-8 outline-none"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl space-y-2">
          <h2 id="endless-iterations" className="text-2xl">
            Endless iterations
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Endless iterations, and stakeholder, business and brand alignment at
            every step.
          </p>
        </div>
      </div>

      <div
        data-project="rakuten-link"
        className={cn(linkFonts, 'bigger-container space-y-4')}
      >
        <div
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${SLIDES.length}: ${caption}`}
          className="border-surface-border aspect-video overflow-hidden rounded-2xl border scheme-light"
        >
          <Scene />
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-foreground" aria-live="polite">
            {caption}
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-muted-foreground text-sm tabular-nums">
              {index + 1} / {SLIDES.length}
            </span>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(index - 1)}
              className="border-border hover:bg-muted focus-visible:ring-ring flex size-10 items-center justify-center rounded-full border outline-none focus-visible:ring-2"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(index + 1)}
              className="border-border hover:bg-muted focus-visible:ring-ring flex size-10 items-center justify-center rounded-full border outline-none focus-visible:ring-2"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.caption}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
                className={cn(
                  'focus-visible:ring-ring h-2 rounded-full outline-none transition-[width,background-color] focus-visible:ring-2',
                  i === index
                    ? 'bg-foreground w-6'
                    : 'bg-muted-foreground/40 w-2',
                )}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Illustrations of the process, not the original files.
          </p>
        </div>
      </div>
    </section>
  );
}
