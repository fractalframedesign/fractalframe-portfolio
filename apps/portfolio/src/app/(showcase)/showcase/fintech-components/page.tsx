import type { Metadata } from 'next';

import {
  fintechSections,
  fintechWidgets,
} from '@/components/project-demos/fintech-components/sections';
import { widgetMap } from '@/components/project-demos/fintech-components/widget-map';
import { FigmaBankingWidgets } from '@/components/project-demos/fintech-components/widgets/FigmaBankingWidgets';
import ComponentGallery from '@/components/showcase/component-gallery';

export const metadata: Metadata = {
  title: 'Fintech Components',
};

export default function Page() {
  return (
    <>
      <ComponentGallery
        scope="fintech"
        categories={fintechSections.map((section) => ({
          id: section.id,
          label: section.eyebrow,
        }))}
        items={fintechWidgets.map((widget) => {
          const Widget = widgetMap[widget.file];
          return {
            id: `widget-${widget.slug}`,
            name: widget.name,
            description: widget.description,
            category: widget.section.id,
            href: `/showcase/fintech-components/${widget.slug}`,
            preview: <Widget />,
          };
        })}
      />

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
