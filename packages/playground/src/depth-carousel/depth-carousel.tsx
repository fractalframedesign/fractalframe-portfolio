'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from '../ui/button';

export type DepthCarouselItem = {
  title: string;
  description: string;
  image: string;
  href?: string;
  newTab?: boolean;
};

/** Each card behind the front one sits this much further right, back and turned */
const STEP = { x: 44, z: 320, turn: -16 };
/** Cards deeper than this fade away */
const DEEPEST = 5.4;
const DRAG_DISTANCE = 60;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const wrap = (value: number, count: number) =>
  ((value % count) + count) % count;

const Card = ({
  item,
  index,
  count,
  position,
  isFront,
  onSelect,
}: {
  item: DepthCarouselItem;
  index: number;
  count: number;
  position: MotionValue<number>;
  isFront: boolean;
  onSelect: () => void;
}) => {
  // 0 is the front, 1 the card behind it and so on. Just below 0 means the
  // card is on its way out past the viewer.
  const depth = useTransform(position, (value) => {
    const raw = wrap(index - value, count);
    return raw > count - 0.5 ? raw - count : raw;
  });
  const transform = useTransform(depth, (value) =>
    value >= 0
      ? `translateX(${value * STEP.x}%) translateZ(${-value * STEP.z}px) rotateY(${STEP.turn}deg)`
      : `translateX(${value * STEP.x * 2.4}%) translateZ(${-value * STEP.z * 0.7}px) rotateY(${STEP.turn}deg)`,
  );
  const opacity = useTransform(depth, (value) =>
    value < 0
      ? clamp01(1 + value * 2.4)
      : clamp01(Math.min(DEEPEST, count - 0.6) - value),
  );
  const pointerEvents = useTransform(opacity, (value) =>
    value > 0.5 ? 'auto' : 'none',
  );

  const picture = (
    <Image
      src={item.image}
      alt=""
      fill
      sizes="(min-width: 768px) 28rem, 70vw"
      className="object-cover"
      draggable={false}
    />
  );
  const face =
    'bg-muted outline-foreground/10 relative block size-full overflow-hidden rounded-2xl shadow-2xl outline -outline-offset-1 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

  return (
    <motion.li
      className="absolute inset-y-0 start-0 aspect-4/5 origin-left"
      style={{ transform, opacity, pointerEvents }}
    >
      {isFront && item.href ? (
        <Link
          href={item.href}
          {...(item.newTab && { target: '_blank', rel: 'noopener noreferrer' })}
          aria-label={`Open ${item.title}`}
          className={face}
        >
          {picture}
        </Link>
      ) : (
        <button
          type="button"
          // The arrows and dashes already move between cards for keyboard users
          tabIndex={-1}
          aria-label={`Show ${item.title}`}
          onClick={onSelect}
          className={cn(face, !isFront && 'cursor-pointer')}
        >
          {picture}
        </button>
      )}
    </motion.li>
  );
};

/**
 * Cards lined up into the distance. The front one is described on the left;
 * arrows, dashes, dragging or the built-in timer bring the next one forward.
 */
export default function DepthCarousel({
  items,
  label,
  interval = 5000,
  className,
}: {
  items: DepthCarouselItem[];
  /** What the carousel shows, for screen readers */
  label: string;
  /** Milliseconds each card stays in front. 0 turns the timer off */
  interval?: number;
  className?: string;
}) {
  const count = items.length;
  const still = useReducedMotion() ?? false;
  const frame = useRef<HTMLElement>(null);
  const dragStart = useRef<number | null>(null);
  // Counts every step ever taken, so "next" always travels forward
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const position = useSpring(0, { stiffness: 110, damping: 22, mass: 0.9 });

  useEffect(() => {
    if (still) position.jump(step);
    else position.set(step);
  }, [position, step, still]);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (count === 0) return null;

  const active = wrap(step, count);
  const current = items[active];
  const playing = interval > 0 && !still && !held && onScreen && count > 1;
  const go = (change: number) => setStep((value) => value + change);
  // Take the shortest way round to a chosen card
  const goTo = (index: number) => {
    const forward = wrap(index - active, count);
    go(forward <= count / 2 ? forward : forward - count);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  };

  return (
    <section
      ref={frame}
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className={cn(
        'grid items-center gap-10 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-16',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-8 md:min-h-80 md:justify-between">
        <p className="flex items-start gap-2" aria-hidden="true">
          <span className="text-6xl leading-none font-light tabular-nums">
            {String(active + 1).padStart(2, '0')}
          </span>
          <span className="text-muted-foreground text-sm tabular-nums">
            / {String(count).padStart(2, '0')}
          </span>
        </p>

        <div className="space-y-8">
          {/* Announced only when the visitor is in control, not on every timed step */}
          <div className="min-h-32" aria-live={playing ? 'off' : 'polite'}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className="space-y-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                <h3 className="text-3xl leading-tight">{current.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-4">
            <ul className="flex items-center gap-1.5">
              {items.map((item, index) => (
                <li key={item.title}>
                  <button
                    type="button"
                    aria-label={`Show ${item.title}`}
                    aria-current={index === active ? 'true' : undefined}
                    onClick={() => goTo(index)}
                    // A thin dash with a taller invisible area that is easy to hit
                    className="focus-visible:ring-ring group flex h-6 cursor-pointer items-center rounded-sm outline-none focus-visible:ring-2"
                  >
                    <span
                      className={cn(
                        'bg-border group-hover:bg-muted-foreground relative block h-0.5 overflow-hidden rounded-full transition-[width,background-color] duration-300',
                        index === active ? 'w-12' : 'w-4',
                      )}
                    >
                      {index === active && (
                        <motion.span
                          // Restarts whenever the card changes or the timer resumes
                          key={`${step}-${playing}`}
                          className="bg-foreground absolute inset-0 origin-left"
                          initial={{ scaleX: playing ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: playing ? interval / 1000 : 0,
                            ease: 'linear',
                          }}
                          onAnimationComplete={() => {
                            if (playing) go(1);
                          }}
                        />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="icon-lg"
                className="rounded-full"
                aria-label="Previous"
                onClick={() => go(-1)}
              >
                <ArrowLeft aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                className="rounded-full"
                aria-label="Next"
                onClick={() => go(1)}
              >
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ul
        className="relative h-80 touch-pan-y perspective-[1600px] perspective-origin-[80%_20%] transform-3d select-none md:h-80"
        onPointerDown={(event) => {
          dragStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (dragStart.current === null) return;
          const moved = event.clientX - dragStart.current;
          dragStart.current = null;
          // Dragging left pulls the next card forward
          if (Math.abs(moved) > DRAG_DISTANCE) go(moved < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
        {items.map((item, index) => (
          <Card
            key={item.title}
            item={item}
            index={index}
            count={count}
            position={position}
            isFront={index === active}
            onSelect={() => goTo(index)}
          />
        ))}
      </ul>
    </section>
  );
}
