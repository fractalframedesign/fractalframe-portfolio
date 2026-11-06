import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  fintechSections,
  fintechWidgets,
  getFintechWidget,
} from '@/components/project-demos/fintech-components/sections';
import ComponentPicker from '@/components/project-demos/fintech-components/studio/component-picker';
import WidgetStudio from '@/components/project-demos/fintech-components/studio/widget-studio';
import { widgetMap } from '@/components/project-demos/fintech-components/widget-map';
import { Button } from '@/components/ui/button';
import { readComponentSource } from '@/lib/component-source';

const base = '/showcase/fintech-components';

const pickerCategories = fintechSections.map((section) => ({
  id: section.id,
  label: section.eyebrow,
  components: fintechWidgets
    .filter((widget) => widget.section.id === section.id)
    .map((widget) => ({ slug: widget.slug, name: widget.name })),
}));

type Props = { params: Promise<{ widget: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return fintechWidgets.map((widget) => ({ widget: widget.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const widget = getFintechWidget((await params).widget);
  return widget ? { title: widget.name, description: widget.description } : {};
}

export default async function WidgetPage({ params }: Props) {
  const widget = getFintechWidget((await params).widget);
  if (!widget) notFound();

  const Widget = widgetMap[widget.file];
  const code = await readComponentSource(
    `fintech-components/widgets/${widget.file}`,
  );

  const index = fintechWidgets.indexOf(widget);
  const previous = fintechWidgets[index - 1];
  const next = fintechWidgets[index + 1];

  return (
    <article data-preview="fintech" className="text-foreground">
      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <ComponentPicker
                categories={pickerCategories}
                current={widget.slug}
                base={base}
              />
              <span aria-hidden className="bg-border h-6 w-px" />
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {widget.name}
              </h1>
            </div>
            <p className="text-muted-foreground text-pretty">
              {widget.description}
            </p>
          </div>

          <nav aria-label="More components" className="flex gap-2">
            {previous && (
              <Button
                asChild
                variant="outline"
                size="icon"
                tooltip={previous.name}
                className="rounded-full"
              >
                <Link
                  href={`${base}/${previous.slug}`}
                  aria-label={`Previous: ${previous.name}`}
                >
                  <ArrowLeft />
                </Link>
              </Button>
            )}
            {next && (
              <Button
                asChild
                variant="outline"
                size="icon"
                tooltip={next.name}
                className="rounded-full"
              >
                <Link
                  href={`${base}/${next.slug}`}
                  aria-label={`Next: ${next.name}`}
                >
                  <ArrowRight />
                </Link>
              </Button>
            )}
          </nav>
        </header>

        <WidgetStudio
          code={code}
          notes={
            <section
              key="when-to-use"
              className="bg-card border-border space-y-1.5 rounded-3xl border p-4"
            >
              <h2 className="text-sm font-semibold">When to use</h2>
              <p className="text-muted-foreground text-sm text-pretty">
                {widget.section.description}
              </p>
            </section>
          }
        >
          <Widget />
        </WidgetStudio>
      </div>
    </article>
  );
}
