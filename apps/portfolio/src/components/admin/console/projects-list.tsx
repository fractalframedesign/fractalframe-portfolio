'use client';

import { Globe, Lock, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ProjectRow } from '@/lib/access/admin-queries';
import type { AccessLevel } from '@/lib/access/levels';

import InviteButton from './invite-button';
import ProjectAccessMenu from './project-access-menu';

type Filter = 'all' | 'public' | 'unlocked';

const FILTERS: { value: Filter; label: string; icon?: LucideIcon }[] = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public', icon: Globe },
  { value: 'unlocked', label: 'Password Protected', icon: Lock },
];

const EMPTY: Record<Filter, string> = {
  all: 'No projects yet.',
  public: 'No public projects.',
  unlocked: 'No password-protected projects yet.',
};

// Protected first, then hidden, then public
const ORDER: Record<AccessLevel, number> = { unlocked: 0, admin: 1, public: 2 };

type ProjectsListProps = { projects: ProjectRow[] };

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const shown = projects
    .filter((project) => filter === 'all' || project.level === filter)
    .sort((a, b) => ORDER[a.level] - ORDER[b.level]);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Filter projects"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={filter === value ? 'secondary' : 'outline'}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {Icon && <Icon aria-hidden />}
                {label}
              </Button>
            ))}
          </div>
          <InviteButton label="Invite someone" />
        </div>

        {/* Announces the result of a filter change */}
        <p role="status" className="text-muted-foreground text-sm">
          {shown.length} {shown.length === 1 ? 'project' : 'projects'}
        </p>

        {shown.length === 0 ? (
          <p className="text-muted-foreground py-6 text-sm">{EMPTY[filter]}</p>
        ) : (
          <ul className="divide-y">
            {shown.map((project) => (
              <li
                key={project.slug}
                id={project.slug}
                className="flex min-h-14 scroll-mt-20 items-center justify-between gap-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-medium">{project.name}</p>
                  {project.level === 'unlocked' && (
                    <Badge className="bg-info-subtle text-info-subtle-foreground border-transparent">
                      <Lock aria-hidden />
                      Password protected
                    </Badge>
                  )}
                  {project.level === 'admin' && (
                    <Badge variant="secondary">Hidden</Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <ProjectAccessMenu
                    // Remount after a refresh so the menu shows the stored level
                    key={`${project.slug}-${project.level}`}
                    slug={project.slug}
                    name={project.name}
                    level={project.level}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
