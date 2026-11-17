'use client';

import TunnelGallery from '@kiran/playground/tunnel-gallery';
import { Box, Rows3 } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { ProjectFrontmatter } from '@/lib/types';

import ProjectsList, { projectHref } from './projects-list';

type ListedProject = ProjectFrontmatter & { locked?: boolean };

const VIEWS = ['list', '3d'] as const;

/** The Projects page body: the full list, or the same projects as a 3D tunnel */
export default function ProjectsBrowser({
  projects,
}: {
  projects: ListedProject[];
}) {
  const [view, setView] = useQueryState(
    'view',
    parseAsStringLiteral(VIEWS).withDefault('list'),
  );

  return (
    <>
      <div className="container mt-8">
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="How to show the projects"
          value={view}
          // Radix sends an empty value when the active button is pressed again
          onValueChange={(next) => {
            if (next === 'list' || next === '3d') void setView(next);
          }}
        >
          <ToggleGroupItem value="list" className="px-3">
            <Rows3 aria-hidden="true" />
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="3d" className="px-3">
            <Box aria-hidden="true" />
            3D
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === '3d' ? (
        <div className="bigger-container mt-8">
          <TunnelGallery
            label="All projects as a 3D gallery. The List view shows the same projects."
            items={projects.map((project) => ({
              title: project.name,
              image: project.imagePlaceholder ? undefined : project.image,
              href: projectHref(project),
              newTab: project.openInNewTab,
            }))}
          />
        </div>
      ) : (
        <ProjectsList projects={projects} />
      )}
    </>
  );
}
