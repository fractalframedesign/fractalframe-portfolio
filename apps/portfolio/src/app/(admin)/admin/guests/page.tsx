import type { Metadata } from 'next';

import AdminHeader from '@/components/admin/admin-header';
import GuestList from '@/components/admin/guest-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { listGuests } from '@/lib/access/repo/guests';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';

export const metadata: Metadata = { title: 'All guests' };

async function loadGuests() {
  const [guests, projects] = await Promise.all([
    listGuests(getDb()),
    getAllProjects(),
  ]);
  return {
    guests,
    projectNames: Object.fromEntries(
      projects.map((project) => [project.slug, project.name]),
    ),
  };
}

export default async function AdminGuestsPage() {
  await requireAdmin();

  let data: Awaited<ReturnType<typeof loadGuests>> | undefined;
  try {
    data = await loadGuests();
  } catch (error) {
    console.error('Admin guest list failed to load', error);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <AdminHeader
        title="All guests"
        link={{ href: '/admin', label: 'Back to dashboard' }}
      />
      {data ? (
        <GuestList
          guests={data.guests}
          projectNames={data.projectNames}
          now={new Date()}
        />
      ) : (
        <Alert variant="destructive">
          <AlertTitle>The database can&apos;t be reached</AlertTitle>
          <AlertDescription>
            Nothing has changed. Reload the page in a minute.
          </AlertDescription>
        </Alert>
      )}
    </main>
  );
}
