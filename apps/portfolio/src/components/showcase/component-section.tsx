import Link from 'next/link';

import { cn } from '@/lib/utils';

type ComponentSectionProps = {
  id: string;
  /** Value of data-preview, selects the project's component theme */
  scope: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Components in this section, linked from the list beside the heading */
  items: Array<{ id: string; name: string }>;
  /** Force the dark palette so bands alternate light and dark */
  dark?: boolean;
  children: React.ReactNode;
};

/**
 * Full-width band that explains a group of components: eyebrow, headline,
 * description and a linked component list on top, live previews below.
 */
export function ComponentSection({
  id,
  scope,
  eyebrow,
  title,
  description,
  items,
  dark = false,
  children,
}: ComponentSectionProps) {
  return (
    <section
      id={id}
      data-preview={scope}
      className={cn(
        'bg-background text-foreground border-border scroll-mt-16 border-t',
        dark && 'dark',
      )}
    >
      <div className="mx-auto max-w-7xl gap-8 px-4 py-16 md:px-8 md:py-24 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="mb-12 lg:mb-0">
          <div className="space-y-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
            <div className="space-y-4">
              <p className="text-primary text-sm font-medium">{eyebrow}</p>
              <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight text-balance lg:text-4xl">
                {title}
              </h2>
              <p className="text-muted-foreground text-pretty">{description}</p>
            </div>

            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-1">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`#${item.id}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 py-1 text-sm transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-primary/60 size-1.5 shrink-0 rounded-full"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="gap-8 space-y-8 xl:columns-2">{children}</div>
      </div>
    </section>
  );
}
