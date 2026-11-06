'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type GalleryItem = {
  id: string;
  name: string;
  description: string;
  /** Category id, matches one of `categories` */
  category: string;
  /** The item's own page */
  href: string;
  /** Live component, rendered at its real size */
  preview: React.ReactNode;
};

type ComponentGalleryProps = {
  /** Value of data-preview, selects the project's component theme */
  scope: string;
  categories: Array<{ id: string; label: string }>;
  items: GalleryItem[];
};

const ALL = 'all';

/**
 * Pinterest-style masonry of live components: filter chips on top, each item
 * a soft stage with its name and one line underneath, linking to its page.
 * Filtered-out items stay mounted (hidden) so their state survives.
 */
export default function ComponentGallery({
  scope,
  categories,
  items,
}: ComponentGalleryProps) {
  const [active, setActive] = useState(ALL);

  const chips = [
    { id: ALL, label: 'All', count: items.length },
    ...categories.map((category) => ({
      ...category,
      count: items.filter((item) => item.category === category.id).length,
    })),
  ];

  return (
    <section
      data-preview={scope}
      className="bg-background text-foreground border-border border-t"
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8 md:py-14">
        <nav aria-label="Filter components">
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => {
              const selected = active === chip.id;
              return (
                <li key={chip.id}>
                  <Button
                    type="button"
                    size="sm"
                    variant={selected ? 'default' : 'muted'}
                    aria-pressed={selected}
                    onClick={() => setActive(chip.id)}
                    className="rounded-full"
                  >
                    {chip.label}
                    <span
                      className={cn(
                        'tabular-nums',
                        selected
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground',
                      )}
                    >
                      {chip.count}
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        <ul className="columns-1 gap-6 md:columns-2 xl:columns-3">
          {items.map((item) => (
            <li
              key={item.id}
              id={item.id}
              hidden={active !== ALL && item.category !== active}
              className="mb-8 break-inside-avoid scroll-mt-24"
            >
              <article className="space-y-3">
                <div className="bg-muted/60 flex justify-center rounded-3xl p-3 sm:p-4">
                  <div className="w-full max-w-120">{item.preview}</div>
                </div>

                <div className="flex items-start justify-between gap-3 px-1">
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm font-medium">
                      <Link href={item.href} className="hover:underline">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground text-sm text-pretty">
                      {item.description}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    tooltip="Open"
                    tooltipSide="top"
                    className="size-8 shrink-0 rounded-full"
                  >
                    <Link href={item.href} aria-label={`Open ${item.name}`}>
                      <ArrowUpRight />
                    </Link>
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
