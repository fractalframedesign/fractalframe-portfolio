import type { Metadata } from 'next';

import AdminHeader from '@/components/admin/admin-header';
import GuestTable from '@/components/admin/guest-table';
import LevelSelect from '@/components/admin/level-select';
import RequestInbox from '@/components/admin/request-inbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAdminDate } from '@/lib/access/admin-format';
import { canBeUnlocked, resolveLevel } from '@/lib/access/levels';
import { listGrantsByProduct } from '@/lib/access/repo/guests';
import { getStoredLevels } from '@/lib/access/repo/products';
import { listPendingRequests } from '@/lib/access/repo/requests';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';

export const metadata: Metadata = { title: 'Dashboard' };

const LEVEL_HELP = [
  { level: 'Public', text: 'anyone can open it.' },
  {
    level: 'Password protected',
    text: 'only guests you add, with their password.',
  },
];

async function loadDashboard() {
  const db = getDb();
  const [projects, levels, requests] = await Promise.all([
    getAllProjects(),
    getStoredLevels(db),
    listPendingRequests(db),
  ]);
  const names = new Map(
    projects.map((project) => [project.slug, project.name]),
  );
  const rows = projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    level: resolveLevel(project.slug, levels),
    canUnlock: canBeUnlocked(project.slug),
  }));
  const unlocked = rows.filter((row) => row.level === 'unlocked');
  const grants = await Promise.all(
    unlocked.map((row) => listGrantsByProduct(db, row.slug)),
  );

  return {
    rows,
    unlocked: unlocked.map(({ slug, name }) => ({ slug, name })),
    grants,
    requests: requests.map((request) => ({
      id: request.id,
      name: request.name,
      email: request.email,
      message: request.message,
      productSlug: request.productSlug,
      projectName: names.get(request.productSlug) ?? request.productSlug,
      receivedLabel: formatAdminDate(request.createdAt),
    })),
  };
}

type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;

const HEADER_LINK = { href: '/admin/guests', label: 'All guests' };

export default async function AdminPage() {
  await requireAdmin();

  let data: Dashboard;
  try {
    data = await loadDashboard();
  } catch (error) {
    console.error('Admin dashboard failed to load', error);
    return <DatabaseDown />;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-10">
      <AdminHeader title="Admin" link={HEADER_LINK} />

      <section aria-labelledby="requests" className="space-y-4">
        <h2 id="requests" className="text-lg font-semibold">
          Requests
        </h2>
        <RequestInbox requests={data.requests} projects={data.unlocked} />
      </section>

      <ProjectsSection rows={data.rows} />
      <GuestsSection data={data} now={new Date()} />
    </main>
  );
}

function DatabaseDown() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <AdminHeader title="Admin" link={HEADER_LINK} />
      <Alert variant="destructive">
        <AlertTitle>The database can&apos;t be reached</AlertTitle>
        <AlertDescription>
          Nothing has changed. Reload the page in a minute.
        </AlertDescription>
      </Alert>
    </main>
  );
}

function ProjectsSection({ rows }: { rows: Dashboard['rows'] }) {
  return (
    <section aria-labelledby="projects" className="space-y-4">
      <div className="space-y-1">
        <h2 id="projects" className="text-lg font-semibold">
          Projects
        </h2>
        <ul className="text-muted-foreground text-sm">
          {LEVEL_HELP.map((item) => (
            <li key={item.level}>
              <span className="text-foreground">{item.level}</span>: {item.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="w-40">Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.slug}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  {/* Keyed on the level so it re-syncs after a save elsewhere */}
                  <LevelSelect key={`${row.slug}-${row.level}`} {...row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function GuestsSection({ data, now }: { data: Dashboard; now: Date }) {
  return (
    <section aria-labelledby="guests" className="space-y-6">
      <h2 id="guests" className="text-lg font-semibold">
        Guests
      </h2>
      {data.unlocked.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No project is password protected. Set one to Password protected
          above to give people access with a password.
        </p>
      ) : (
        data.unlocked.map((project, index) => (
          <GuestTable
            key={project.slug}
            project={project}
            grants={data.grants[index] ?? []}
            projects={data.unlocked}
            now={now}
          />
        ))
      )}
    </section>
  );
}
