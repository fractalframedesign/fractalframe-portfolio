'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  type KeyboardEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '../lib/utils';
import { Button } from '../ui/button';

export type FollowAccordionItem = {
  title: string;
  description: string;
  image: { src: string; alt: string };
  link?: { label: string; href: string };
};

/** Space between items, in pixels. Matches `gap-1.5` on the list */
const ITEM_GAP = 6;
const SPRING = { type: 'spring', duration: 0.7, bounce: 0.12 } as const;
const FADE = { duration: 0.3 };

type Sizes = { headers: number[]; contents: number[]; image: number };

/** The picture for one item, filling its frame */
const Picture = ({
  item,
  sizes,
}: {
  item: FollowAccordionItem;
  sizes: string;
}) => (
  <Image
    src={item.image.src}
    alt={item.image.alt}
    fill
    sizes={sizes}
    className="object-cover"
    draggable={false}
  />
);

/**
 * An accordion with a picture beside it. Opening an item slides the picture
 * down to sit level with it and morphs it into that item's picture. On narrow
 * screens the picture moves inside the open item instead.
 */
export default function FollowAccordion({
  items,
  defaultOpen = 0,
  className,
}: {
  items: FollowAccordionItem[];
  /** Which item starts open. -1 starts with all closed */
  defaultOpen?: number;
  className?: string;
}) {
  const id = useId();
  const reduced = useReducedMotion() ?? false;
  const spring = reduced ? { duration: 0 } : SPRING;
  const fade = reduced ? { duration: 0 } : FADE;
  const [open, setOpen] = useState(defaultOpen);
  // The picture stays on the last opened item while everything is closed
  const [shown, setShown] = useState(Math.max(0, defaultOpen));
  const [sizes, setSizes] = useState<Sizes>({
    headers: [],
    contents: [],
    image: 0,
  });
  const headerRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const imageRef = useRef<HTMLDivElement>(null);

  // Measure every title row and every opened body, so the picture can be
  // placed where the open item will end up, not where it is mid-animation
  useLayoutEffect(() => {
    const measure = () => {
      const next: Sizes = {
        headers: headerRefs.current.map((el) => el?.offsetHeight ?? 0),
        contents: contentRefs.current.map((el) => el?.offsetHeight ?? 0),
        image: imageRef.current?.offsetHeight ?? 0,
      };
      setSizes((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    [...headerRefs.current, ...contentRefs.current, imageRef.current].forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, [items.length]);

  const toggle = (index: number) => {
    if (index === open) {
      setOpen(-1);
      return;
    }
    setOpen(index);
    setShown(index);
  };

  // Up and down arrows move between the titles, like a native list
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const target =
      event.key === 'ArrowDown'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowUp'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;
    if (target === -1) return;
    event.preventDefault();
    buttonRefs.current[target]?.focus();
  };

  // Where the picture sits: level with the open item, but never past the end of the list
  const above = sizes.headers
    .slice(0, shown)
    .reduce((sum, height) => sum + height + ITEM_GAP, 0);
  const listHeight =
    sizes.headers.reduce((sum, height) => sum + height, 0) +
    ITEM_GAP * Math.max(0, items.length - 1) +
    (open >= 0 ? (sizes.contents[open] ?? 0) : 0);
  const offset = Math.max(0, Math.min(above, listHeight - sizes.image));

  return (
    <div
      className={cn(
        'grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_46%] md:gap-12',
        className,
      )}
    >
      <ul className="flex flex-col gap-1.5">
        {items.map((item, index) => {
          const isOpen = index === open;
          const buttonId = `${id}-button-${index}`;
          const panelId = `${id}-panel-${index}`;
          return (
            <li
              key={item.title}
              className={cn(
                'overflow-hidden rounded-2xl transition-colors duration-300',
                isOpen ? 'bg-muted' : 'hover:bg-muted/50',
              )}
            >
              <h3
                ref={(el) => {
                  headerRefs.current[index] = el;
                }}
              >
                <button
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className="focus-visible:ring-ring flex min-h-16 w-full cursor-pointer items-center gap-4 rounded-2xl px-5 py-3 text-start outline-none focus-visible:ring-2 md:min-h-19 md:gap-5 md:px-7"
                >
                  <motion.span
                    aria-hidden="true"
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-300 md:size-9',
                      isOpen
                        ? 'bg-foreground text-background'
                        : 'bg-foreground/5 text-foreground',
                    )}
                  >
                    {index + 1}
                  </motion.span>
                  <span className="min-w-0 flex-1 text-xl leading-snug md:text-2xl">
                    {item.title}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={spring}
                  >
                    <ChevronDown className="size-5" />
                  </motion.span>
                </button>
              </h3>

              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen && reduced}
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0 }}
                transition={spring}
                className="overflow-hidden"
              >
                <div
                  ref={(el) => {
                    contentRefs.current[index] = el;
                  }}
                  // Indented to line up with the title, past the number
                  className="space-y-5 px-5 pb-6 md:ps-21 md:pe-7"
                >
                  {/* On narrow screens the picture lives inside the open item */}
                  <div className="bg-muted relative aspect-7/5 overflow-hidden rounded-xl md:hidden">
                    <Picture item={item} sizes="100vw" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  {item.link && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full"
                      tabIndex={isOpen ? undefined : -1}
                    >
                      <Link href={item.link.href}>
                        {item.link.label}
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>

      {/* Wide screens: one picture beside the list that follows the open item */}
      <motion.div
        ref={imageRef}
        aria-hidden="true"
        initial={false}
        animate={{ y: offset }}
        transition={spring}
        className="bg-muted relative hidden aspect-7/5 overflow-hidden rounded-3xl md:block"
      >
        {items.map((item, index) => {
          const isShown = index === shown;
          return (
            <motion.div
              key={item.title}
              className="absolute inset-0"
              initial={false}
              // The new picture grows in from a rounded inset while the old one fades
              animate={{
                opacity: isShown ? 1 : 0,
                scale: isShown ? 1 : 1.06,
                clipPath: isShown
                  ? 'inset(0% 0% 0% 0% round 0px)'
                  : 'inset(8% 8% 8% 8% round 24px)',
              }}
              transition={isShown ? spring : fade}
              style={{ zIndex: isShown ? 1 : 0 }}
            >
              <Picture item={item} sizes="(min-width: 952px) 400px, 46vw" />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
