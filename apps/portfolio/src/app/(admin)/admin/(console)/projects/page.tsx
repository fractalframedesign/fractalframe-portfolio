import { EyeOff, Globe, Lock } from 'lucide-react';
import type { Metadata } from 'next';

import AccessSwitch from '@/components/admin/console/access-switch';
import InviteButton from '@/components/admin/console/invite-button';
import SectionCard from '@/components/admin/console/section-card';
import TopBar from '@/components/admin/console/top-bar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getProjectRows, type ProjectRow } from '@/lib/access/admin-queries';
import type { AccessLevel } from '@/lib/access/levels';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';

export const metadata: Metadata = { title: 'Projects' };

const PAGE_TITLE = 'Projects';

const LEVEL_ICONS: Record<AccessLevel, typeof Lock> = {
  public: Globe,
  unlocked: Lock,
  admin: EyeOff,
};

type Rows = Awaited<ReturnType<typeof getProjectRows>>;

export default async function AdminProjectsPage() {
  await requireAdmin();

  let rows: Rows;
  try {
    rows = await getProjectRows(getDb(), new Date());
  } catch (error) {
    console.error('Admin projects failed to load', error);
    return <DatabaseDown />;
  }

  const invitable = rows.demo
    .filter((project) => project.level === 'unlocked')
    .map(({ slug, name }) => ({ slug, name }));

  return (
    <>
      <TopBar title={PAGE_TITLE} />
      <div className="space-y-6 p-4 md:p-6">
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.demo.map((project) => (
            <li key={project.slug} id={project.slug} className="scroll-mt-20">
              <DemoProjectCard project={project} invitable={invitable} />
            </li>
          ))}
        </ul>

        <AlwaysPublic projects={rows.other} />
      </div>
    </>
  );
}

function DemoProjectCard({
  project,
  invitable,
}: {
  project: ProjectRow;
  invitable: { slug: string; name: string }[];
}) {
  const unlocked = project.level === 'unlocked';

  return (
    <SectionCard
      title={project.name}
      icon={LEVEL_ICONS[project.level]}
      action={
        unlocked && (
          <Badge className="bg-info-subtle text-info-subtle-foreground border-transparent">
            Password protected
          </Badge>
        )
      }
    >
      <div className="space-y-4">
        <AccessSwitch
          // Remount after a refresh so the switch shows the stored level
          key={`${project.slug}-${project.level}`}
          slug={project.slug}
          name={project.name}
          level={project.level}
          hasDemo={project.hasDemo}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm tabular-nums">
            {project.guestCount} {project.guestCount === 1 ? 'guest' : 'guests'}
          </p>
          {unlocked && (
            <InviteButton slug={project.slug} projects={invitable} />
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function AlwaysPublic({ projects }: { projects: ProjectRow[] }) {
  return (
    <SectionCard title="Always public" icon={Globe}>
      <ul className="divide-y">
        {projects.map((project) => (
          <li
            key={project.slug}
            id={project.slug}
            className="flex scroll-mt-20 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <p className="truncate text-sm font-medium">{project.name}</p>
            {project.level !== 'public' ? (
              <AccessSwitch
                key={`${project.slug}-${project.level}`}
                slug={project.slug}
                name={project.name}
                level={project.level}
                hasDemo={project.hasDemo}
              />
            ) : (
              <p className="text-muted-foreground shrink-0 text-sm">Public</p>
            )}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function DatabaseDown() {
  return (
    <>
      <TopBar title={PAGE_TITLE} />
      <div className="space-y-6 p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>The database can&apos;t be reached</AlertTitle>
          <AlertDescription>
            Nothing has changed. Reload the page in a minute.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
