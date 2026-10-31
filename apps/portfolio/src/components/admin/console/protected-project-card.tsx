import { Lock } from 'lucide-react';

import type { ProtectedProjectRow } from '@/lib/access/admin-queries';

import InviteButton from './invite-button';
import SectionCard from './section-card';

type ProtectedProjectCardProps = { projects: ProtectedProjectRow[] };

/** Every password-protected project; one guest password opens them all */
export default function ProtectedProjectCard({
  projects,
}: ProtectedProjectCardProps) {
  return (
    <SectionCard
      title="Protected projects"
      icon={Lock}
      action={<InviteButton />}
    >
      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No project is password protected yet. Use Add password on Projects.
        </p>
      ) : (
        <ul className="divide-y">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="truncate py-3 text-sm font-medium first:pt-0 last:pb-0"
            >
              {project.name}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
