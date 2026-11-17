'use client';

import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from '../ui/button';

export type AudienceCard = {
  number: string;
  label: string;
  title: string;
  description: string;
  /** A second line under the description. Leave empty for none */
  detail: string;
  cta: string;
  image: string;
  alt: string;
  href: string;
  /** CSS background-position for the picture */
  position: string;
};

/** The slow-out curve shared by everything that grows or slides */
const GLIDE = 'ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

/**
 * A row of picture cards. The one you point at or tap grows and shows its
 * details and link; on a phone they stack and the open one gets taller.
 */
export default function AudienceExpandCards({
  items,
  label,
}: {
  items: AudienceCard[];
  /** What the cards are for, for screen readers */
  label: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-full flex-col gap-2 md:h-[min(68svh,42rem)] md:min-h-128 md:flex-row md:gap-3"
    >
      {items.map((item, index) => {
        const isActive = activeIndex === index;

        return (
          <article
            key={item.number}
            // Always dark, in the light theme too, so the words read over the picture
            className={cn(
              'dark bg-card text-foreground relative isolate flex min-w-0 flex-none overflow-hidden rounded-2xl bg-cover transition-[flex-grow,min-height] duration-650 md:min-h-0 md:flex-[0.72_1_0%] md:rounded-3xl',
              GLIDE,
              isActive
                ? 'min-h-[clamp(20rem,95vw,24rem)] md:grow-[2.35]'
                : 'min-h-19',
            )}
            style={{
              backgroundImage: `url("${item.image}")`,
              backgroundPosition: item.position,
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setActiveIndex(index);
            }}
          >
            {/* Shade over the picture: darker towards the words at the bottom */}
            <span
              aria-hidden="true"
              className="from-background/0 to-background/80 absolute inset-0 -z-10 bg-linear-to-b from-20%"
            />
            <span
              aria-hidden="true"
              className={cn(
                'bg-background/20 absolute inset-0 -z-10 transition-opacity duration-350 motion-reduce:transition-none',
                isActive && 'opacity-15',
              )}
            />

            <button
              type="button"
              aria-expanded={isActive}
              aria-label={`${item.label.replace('FOR ', '')}: ${item.title}`}
              onClick={() => setActiveIndex(index)}
              className="focus-visible:ring-foreground absolute inset-0 flex w-full cursor-pointer flex-col justify-between rounded-[inherit] p-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-inset md:p-6"
            >
              <span className="flex items-center gap-2.5 text-xs font-semibold tracking-widest whitespace-nowrap">
                <span>{item.number}</span>
                <span
                  className={cn(
                    'max-w-40 overflow-hidden transition-[max-width,opacity] duration-450',
                    GLIDE,
                    isActive ? 'delay-100' : 'md:max-w-0 md:opacity-0',
                  )}
                >
                  {item.label}
                </span>
              </span>
              <span className="flex w-full flex-col items-start gap-2.5 pb-16 md:pb-1.5">
                <span
                  className={cn(
                    'leading-none tracking-tighter whitespace-nowrap md:text-[clamp(1.4rem,2.6vw,2.55rem)]',
                    isActive ? 'text-3xl' : 'text-2xl',
                  )}
                >
                  {item.title}
                </span>
                <span
                  className={cn(
                    'grid max-w-120 gap-1.5 overflow-hidden pe-3 text-sm leading-normal transition-opacity duration-250 motion-reduce:transition-none md:pe-0 md:text-base',
                    isActive ? 'delay-120' : 'opacity-0',
                  )}
                >
                  <span>{item.description}</span>
                  {item.detail ? <span>{item.detail}</span> : null}
                </span>
              </span>
            </button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className={cn(
                'border-foreground/70 bg-background/20 absolute end-4 bottom-4 rounded-full border transition-[opacity,translate,background-color] duration-200 motion-reduce:transition-none md:end-6 md:bottom-6',
                isActive
                  ? 'delay-120'
                  : 'pointer-events-none translate-y-1.5 opacity-0',
              )}
            >
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                tabIndex={isActive ? 0 : -1}
                aria-hidden={!isActive}
              >
                {item.cta}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </article>
        );
      })}
    </div>
  );
}
