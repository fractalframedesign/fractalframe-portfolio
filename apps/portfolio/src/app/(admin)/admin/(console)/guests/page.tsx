import type { Metadata } from 'next';

import GuestsFilters from '@/components/admin/console/guests-filters';
import GuestsTable from '@/components/admin/console/guests-table';
import InviteButton from '@/components/admin/console/invite-button';
import TopBar from '@/components/admin/console/top-bar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getGuestRows, parseGuestFilters } from '@/lib/access/admin-queries';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';

export const metadata: Metadata = { title: 'Guests' };

const PAGE_TITLE = 'Guests';

type SearchParams = Record<string, string | string[] | undefined>;

async function loadGuests(params: SearchParams, now: Date) {
  const filters = parseGuestFilters(params);
  return { filters, rows: await getGuestRows(getDb(), filters, now) };
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
          <GuestsFilters status={data.filters.status} />
          <InviteButton />
        </div>
        <GuestsTable
          rows={data.rows}
          filtered={Boolean(data.filters.status)}
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
