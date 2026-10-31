'use client';

import { Lock } from 'lucide-react';
import { useState } from 'react';

import AddGuestDialog, {
  type GuestDefaults,
  type ProjectOption,
} from '@/components/admin/add-guest-dialog';
import { Button } from '@/components/ui/button';

import SectionCard from './section-card';

export type ProtectedProject = ProjectOption & { guestCount: number };

type ProtectedProjectCardProps = {
  projects: ProtectedProject[];
};

export default function ProtectedProjectCard({
  projects,
}: ProtectedProjectCardProps) {
  const [defaults, setDefaults] = useState<GuestDefaults>();
  const [open, setOpen] = useState(false);

  return (
    <SectionCard title="Protected projects" icon={Lock}>
      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No project is password protected yet.
        </p>
      ) : (
        <ul className="divide-y">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{project.name}</p>
                <p className="text-muted-foreground text-sm tabular-nums">
                  {project.guestCount}{' '}
                  {project.guestCount === 1 ? 'guest' : 'guests'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDefaults({ products: [project.slug] });
                  setOpen(true);
                }}
              >
                Invite
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AddGuestDialog
        open={open}
        onOpenChange={setOpen}
        projects={projects.map(({ slug, name }) => ({ slug, name }))}
        defaults={defaults}
      />
    </SectionCard>
  );
}
