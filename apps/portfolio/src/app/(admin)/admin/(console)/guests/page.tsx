import type { Metadata } from 'next';

import GuestsFilters from '@/components/admin/console/guests-filters';
import GuestsTable from '@/components/admin/console/guests-table';
import InviteButton from '@/components/admin/console/invite-button';
import TopBar from '@/components/admin/console/top-bar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  getGuestRows,
  type GuestFilters,
  parseGuestFilters,
} from '@/lib/access/admin-queries';
import { resolveLevel } from '@/lib/access/levels';
import { getStoredLevels } from '@/lib/access/repo/products';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';

export const metadata: Metadata = { title: 'Guests' };

const PAGE_TITLE = 'Guests';

type SearchParams = Record<string, string | string[] | undefined>;

async function loadGuests(params: SearchParams, now: Date) {
  const db = getDb();
  const [levels, projects] = await Promise.all([
    getStoredLevels(db),
    getAllProjects(),
  ]);
  const filters: GuestFilters = parseGuestFilters(
    params,
    projects.map((project) => project.slug),
  );
  const rows = await getGuestRows(db, filters, now);

  // Only protected projects can be invited to or picked as a filter, but a
  // filter set on a project that has since gone public still shows
  const options = projects
    .filter(
      (project) =>
        resolveLevel(project.slug, levels) === 'unlocked' ||
        project.slug === filters.project,
    )
    .map(({ slug, name }) => ({ slug, name }));

  return {
    filters,
    rows,
    options,
    invitable: options.filter(
      (option) => resolveLevel(option.slug, levels) === 'unlocked',
    ),
    projectNames: Object.fromEntries(
      projects.map((project) => [project.slug, project.name]),
    ),
  };
}

export default async function AdminGuestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();

  let data: Awaited<ReturnType<typeof loadGuests>>;
  try {
    data = await loadGuests(params, now);
  } catch (error) {
    console.error('Admin guests failed to load', error);
    return <DatabaseDown />;
  }

  return (
    <>
      <TopBar title={PAGE_TITLE} />
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <GuestsFilters
            projects={data.options}
            project={data.filters.project}
            status={data.filters.status}
          />
          <InviteButton projects={data.invitable} />
        </div>
        <GuestsTable
          rows={data.rows}
          projectNames={data.projectNames}
          filtered={Boolean(data.filters.project || data.filters.status)}
          now={now}
        />
      </div>
    </>
  );
}

function DatabaseDown() {
  return (
    <>
      <TopBar title={PAGE_TITLE} />
      <div className="space-y-8 p-4 md:p-6">
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
