import type { Metadata } from 'next';

import RequestsTable from '@/components/admin/console/requests-table';
import TopBar from '@/components/admin/console/top-bar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatAdminDate } from '@/lib/access/admin-format';
import { listRequestsWithGuests } from '@/lib/access/admin-queries';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';

export const metadata: Metadata = { title: 'Requests' };

const PAGE_TITLE = 'Requests';

async function loadRequests() {
  const [pending, projects] = await Promise.all([
    listRequestsWithGuests(getDb()),
    getAllProjects(),
  ]);
  const names = new Map(
    projects.map((project) => [project.slug, project.name]),
  );

  return {
    requests: pending.map((request) => ({
      id: request.id,
      name: request.name,
      email: request.email,
      message: request.message ?? '',
      productSlug: request.productSlug,
      projectName: names.get(request.productSlug) ?? request.productSlug,
      receivedLabel: formatAdminDate(request.createdAt),
      existingGuest: request.existingGuest,
    })),
  };
}

export default async function RequestsPage() {
  await requireAdmin();

  let data: Awaited<ReturnType<typeof loadRequests>>;
  try {
    data = await loadRequests();
  } catch (error) {
    console.error('Admin requests failed to load', error);
    return <DatabaseDown />;
  }

  return (
    <>
      <TopBar title={PAGE_TITLE} />
      <div className="p-4 md:p-6">
        <RequestsTable requests={data.requests} />
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
