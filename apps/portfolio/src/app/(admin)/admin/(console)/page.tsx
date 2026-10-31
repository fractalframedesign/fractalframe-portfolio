import { CalendarClock, Inbox, Lock, Users } from 'lucide-react';
import type { Metadata } from 'next';

import ProtectedProjectCard from '@/components/admin/console/protected-project-card';
import SectionCard from '@/components/admin/console/section-card';
import StatCard from '@/components/admin/console/stat-card';
import TopBar from '@/components/admin/console/top-bar';
import WaitingRequests from '@/components/admin/console/waiting-requests';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatAdminDate } from '@/lib/access/admin-format';
import { getOverview } from '@/lib/access/admin-queries';
import { timeLeftLabel } from '@/lib/access/expiry';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';

export const metadata: Metadata = { title: 'Overview' };

const PAGE_TITLE = 'Overview';

async function loadOverview(now: Date) {
  const [overview, projects] = await Promise.all([
    getOverview(getDb(), now),
    getAllProjects(),
  ]);
  const names = new Map(
    projects.map((project) => [project.slug, project.name]),
  );
  const nameOf = (slug: string) => names.get(slug) ?? slug;

  return {
    stats: overview.stats,
    protectedProjects: overview.protected,
    waiting: overview.waiting.map((request) => ({
      id: request.id,
      name: request.name,
      email: request.email,
      productSlug: request.productSlug,
      projectName: nameOf(request.productSlug),
      receivedLabel: formatAdminDate(request.createdAt),
    })),
    expiring: overview.expiring.map((grant) => ({
      grantId: grant.grantId,
      guestName: grant.guestName,
      projectName: nameOf(grant.projectSlug),
      timeLeft: timeLeftLabel(grant.expiresAt, now),
    })),
  };
}

type Overview = Awaited<ReturnType<typeof loadOverview>>;

export default async function AdminPage() {
  await requireAdmin();

  const now = new Date();
  let data: Overview;
  try {
    data = await loadOverview(now);
  } catch (error) {
    console.error('Admin overview failed to load', error);
    return <DatabaseDown />;
  }

  const { stats } = data;

  return (
    <>
      <TopBar title={PAGE_TITLE} />
      <div className="min-h-[calc(100svh-3.5rem)] space-y-7 bg-muted/30 p-4 md:space-y-8 md:p-8">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Access management</p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Your portfolio at a glance
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Requests waiting"
            value={stats.requestsWaiting}
            icon={Inbox}
            href="/admin/requests"
          />
          <StatCard
            label="Protected projects"
            value={stats.protectedProjects}
            icon={Lock}
            href="/admin/projects"
          />
          <StatCard
            label="Active guests"
            value={stats.activeGuests}
            icon={Users}
            href="/admin/guests?status=active"
          />
          <StatCard
            label="Expiring this week"
            value={stats.expiringThisWeek}
            icon={CalendarClock}
            href="/admin/guests?status=active"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <WaitingRequests
            requests={data.waiting}
            projects={data.protectedProjects.map(({ slug, name }) => ({
              slug,
              name,
            }))}
          />
          <ExpiringSoon expiring={data.expiring} />
        </div>

        <ProtectedProjectCard projects={data.protectedProjects} />
      </div>
    </>
  );
}

function ExpiringSoon({ expiring }: { expiring: Overview['expiring'] }) {
  return (
    <SectionCard title="Expiring soon" icon={CalendarClock}>
      {expiring.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing expires this week.
        </p>
      ) : (
        <ul className="divide-y">
          {expiring.map((grant) => (
            <li
              key={grant.grantId}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {grant.guestName}
                </p>
                <p className="text-muted-foreground truncate text-sm">
                  {grant.projectName}
                </p>
              </div>
              <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
                {grant.timeLeft}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
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
