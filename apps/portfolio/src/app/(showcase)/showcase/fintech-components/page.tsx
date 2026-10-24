import type { Metadata } from 'next';

import { fintechSections } from '@/components/project-demos/fintech-components/sections';
import { WidgetCard } from '@/components/project-demos/fintech-components/widget-card';
import { widgetMap } from '@/components/project-demos/fintech-components/widget-map';
import { FigmaBankingWidgets } from '@/components/project-demos/fintech-components/widgets/FigmaBankingWidgets';
import { ComponentSection } from '@/components/showcase/component-section';
import { readComponentSource } from '@/lib/component-source';

export const metadata: Metadata = {
  title: 'Fintech Components',
};

export default async function Page() {
  const sections = await Promise.all(
    fintechSections.map(async (section) => ({
      ...section,
      widgets: await Promise.all(
        section.widgets.map(async (widget) => ({
          ...widget,
          code: await readComponentSource(
            `fintech-components/widgets/${widget.file}`,
          ),
        })),
      ),
    })),
  );

  return (
    <>
      {sections.map((section, index) => (
        <ComponentSection
          key={section.id}
          id={section.id}
          scope="fintech"
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          items={section.widgets.map((widget) => ({
            id: `widget-${widget.file}`,
            name: widget.name,
          }))}
          dark={index % 2 === 1}
        >
          {section.widgets.map((widget) => {
            const Widget = widgetMap[widget.file];
            return (
              <div key={widget.file} className="break-inside-avoid">
                <WidgetCard
                  id={`widget-${widget.file}`}
                  name={widget.name}
                  code={widget.code}
                >
                  <Widget />
                </WidgetCard>
              </div>
            );
          })}
        </ComponentSection>
      ))}

      <section
        id="figma-widget-set"
        data-preview="fintech"
        className="bg-background text-foreground border-border scroll-mt-16 border-t"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <FigmaBankingWidgets />
        </div>
      </section>
    </>
  );
}
