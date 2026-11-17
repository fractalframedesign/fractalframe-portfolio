'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  type KeyboardEvent,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { KiranLogoIcon } from '../icons';
import { cn } from '../lib/utils';
import { Button } from '../ui/button';

export type StageSlide = {
  title: string;
  description: string;
  image: string;
  href?: string;
  newTab?: boolean;
};

/** Each card takes one of these looks in turn */
const LAYOUTS = ['statement', 'media', 'picture', 'split'] as const;
type Layout = (typeof LAYOUTS)[number];

const SPRING = { type: 'spring', duration: 0.8, bounce: 0.15 } as const;
const SWIPE_DISTANCE = 50;

const wrap = (value: number, count: number) =>
  ((value % count) + count) % count;

const CardLink = ({
  slide,
  label = 'Explore project',
  focusable,
}: {
  slide: StageSlide;
  label?: string;
  focusable: boolean;
}) =>
  slide.href ? (
    <Button
      asChild
      size="sm"
      className="rounded-full"
      // Only the card in the middle can be reached with the keyboard
      tabIndex={focusable ? undefined : -1}
    >
      <Link
        href={slide.href}
        {...(slide.newTab && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {label}
        <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  ) : null;

const Picture = ({ src, sizes }: { src: string; sizes: string }) => (
  <Image
    src={src}
    alt=""
    fill
    sizes={sizes}
    className="object-cover"
    draggable={false}
  />
);

/** The light panel every card is made of */
const Panel = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'bg-card text-card-foreground relative overflow-hidden rounded-4xl',
      className,
    )}
  >
    {children}
  </div>
);

const CardHeader = ({
  slide,
  focusable,
}: {
  slide: StageSlide;
  focusable: boolean;
}) => (
  <div className="flex items-start justify-between gap-3">
    <KiranLogoIcon aria-hidden="true" className="text-logo size-9 shrink-0" />
    <CardLink slide={slide} focusable={focusable} />
  </div>
);

const Card = ({
  slide,
  layout,
  active,
}: {
  slide: StageSlide;
  layout: Layout;
  active: boolean;
}) => {
  if (layout === 'picture') {
    return (
      <Panel className="h-full">
        <Picture src={slide.image} sizes="20rem" />
        <div className="absolute inset-x-5 bottom-5">
          <CardLink slide={slide} label="View project" focusable={active} />
        </div>
      </Panel>
    );
  }

  if (layout === 'split') {
    return (
      <div className="flex h-full flex-col gap-3">
        <Panel className="flex-1">
          <Picture src={slide.image} sizes="20rem" />
          <div className="absolute inset-x-5 bottom-5">
            <CardLink slide={slide} label="View project" focusable={active} />
          </div>
        </Panel>
        <Panel className="space-y-1 p-6">
          <h3 className="text-2xl leading-tight">{slide.title}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {slide.description}
          </p>
        </Panel>
      </div>
    );
  }

  if (layout === 'media') {
    return (
      <Panel className="flex h-full flex-col">
        <div className="space-y-4 p-6 pb-5">
          <CardHeader slide={slide} focusable={active} />
          <div className="space-y-2">
            <h3 className="text-3xl leading-tight">{slide.title}</h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {slide.description}
            </p>
          </div>
        </div>
        <div className="relative mx-1.5 mb-1.5 flex-1 overflow-hidden rounded-[1.6rem]">
          <Picture src={slide.image} sizes="20rem" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="flex h-full flex-col justify-between p-6">
      <CardHeader slide={slide} focusable={active} />
      <div className="space-y-4">
        <h3 className="text-5xl leading-[0.95] tracking-tight">
          {slide.title}
        </h3>
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {slide.description}
        </p>
      </div>
    </Panel>
  );
};

/**
 * A row of cards over a full-bleed picture. Each step slides the cards along
 * and swaps the picture behind them for the new card's. Arrows, arrow keys
 * and swipes move it. Give it a height with `className`.
 */
export default function StageSlider({
  slides,
  label,
  className,
}: {
  slides: StageSlide[];
  /** What the slider shows, for screen readers */
  label: string;
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const spring = reduced ? { duration: 0 } : SPRING;
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(344);
  const firstCard = useRef<HTMLLIElement>(null);
  const swipeStart = useRef<number | null>(null);

  // The distance between two cards, measured so it is right at every width
  useLayoutEffect(() => {
    const card = firstCard.current;
    const row = card?.parentElement;
    if (!card || !row) return;
    const measure = () =>
      setStep(card.offsetWidth + parseFloat(getComputedStyle(row).columnGap));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  if (count === 0) return null;

  const go = (change: number) =>
    setActive((value) => wrap(value + change, count));
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  };
  const current = slides[active];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'bg-muted relative isolate overflow-hidden rounded-3xl border select-none',
        className,
      )}
    >
      {/* The picture behind everything: the new one grows in over the old */}
      <AnimatePresence initial={false}>
        <motion.div
          key={active}
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.9, ease: [0.23, 1, 0.32, 1] }
          }
        >
          <Picture
            src={current.image}
            sizes="(min-width: 952px) 952px, 100vw"
          />
        </motion.div>
      </AnimatePresence>
      {/* Calms a busy picture so the cards stand out from it */}
      <div
        aria-hidden="true"
        className="bg-background/40 absolute inset-0 -z-10"
      />

      <div
        className="absolute inset-x-0 top-14 bottom-24 touch-pan-y"
        onPointerDown={(event) => {
          swipeStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (swipeStart.current === null) return;
          const moved = event.clientX - swipeStart.current;
          swipeStart.current = null;
          if (Math.abs(moved) > SWIPE_DISTANCE) go(moved < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        <motion.ul
          // The middle card sits in the centre; the row slides under it
          className="absolute inset-y-0 start-1/2 -ms-36 flex gap-4 md:-ms-40 md:gap-6"
          initial={false}
          animate={{ x: -active * step }}
          transition={spring}
        >
          {slides.map((slide, index) => {
            const isActive = index === active;
            return (
              <li
                key={slide.title}
                ref={index === 0 ? firstCard : undefined}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}: ${slide.title}`}
                aria-hidden={!isActive}
                className="relative h-full w-72 shrink-0 md:w-80"
              >
                {/* The raised tab that marks the card in the middle */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute end-0 bottom-full w-1/2 origin-bottom"
                  initial={false}
                  animate={{
                    scaleY: isActive ? 1 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={spring}
                >
                  <div className="bg-card h-10 rounded-t-4xl" />
                  <div className="bg-card absolute -start-8 bottom-0 size-8 mask-[radial-gradient(circle_at_0_0,transparent_2rem,black_2rem)]" />
                </motion.div>
                <div
                  className={cn(
                    'h-full',
                    isActive && '[&>div:first-child]:rounded-tr-none',
                  )}
                >
                  <Card
                    slide={slide}
                    layout={LAYOUTS[index % LAYOUTS.length]}
                    active={isActive}
                  />
                </div>
              </li>
            );
          })}
        </motion.ul>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3">
        <p
          aria-live="polite"
          className="bg-foreground/60 text-background rounded-full px-4 py-2 text-sm tabular-nums backdrop-blur-md"
        >
          {active + 1} <span className="opacity-60">/ {count}</span>
        </p>
        <Button
          variant="secondary"
          size="icon-lg"
          className="ms-3 rounded-full"
          aria-label="Previous slide"
          onClick={() => go(-1)}
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <Button
          variant="secondary"
          size="icon-lg"
          className="rounded-full"
          aria-label="Next slide"
          onClick={() => go(1)}
        >
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
