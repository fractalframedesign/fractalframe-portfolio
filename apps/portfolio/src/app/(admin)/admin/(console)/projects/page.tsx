import type { Metadata } from 'next';

import ProjectsList from '@/components/admin/console/projects-list';
import TopBar from '@/components/admin/console/top-bar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getProjectRows } from '@/lib/access/admin-queries';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';

export const metadata: Metadata = { title: 'Projects' };

const PAGE_TITLE = 'Projects';

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

  const projects = [...rows.demo, ...rows.other];
  const invitable = projects
    .filter((project) => project.level === 'unlocked')
    .map(({ slug, name }) => ({ slug, name }));

  return (
    <>
      <TopBar title={PAGE_TITLE} />
      <div className="p-4 md:p-6">
        <ProjectsList projects={projects} invitable={invitable} />
      </div>
    </>
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
