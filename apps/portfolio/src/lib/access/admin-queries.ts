import { and, asc, desc, eq, gt, ilike, lte, or, sql } from 'drizzle-orm';

import type { Db } from '@/lib/db/client';
import { accessRequests, grants, guests } from '@/lib/db/schema';
import { getAllProjects } from '@/lib/projects';

import { isGrantActive } from './expiry';
import { type AccessLevel, canBeUnlocked, resolveLevel } from './levels';
import { type GrantView } from './repo/guests';
import { getStoredLevels } from './repo/products';

export type PendingRequest = typeof accessRequests.$inferSelect;

export type OverviewStats = {
  requestsWaiting: number;
  protectedProjects: number;
  activeGuests: number;
  expiringThisWeek: number;
};

export type ExpiringGrant = {
  grantId: string;
  guestName: string;
  projectSlug: string;
  expiresAt: Date;
};

export type ProtectedProjectRow = {
  slug: string;
  name: string;
  guestCount: number;
};

export type ProjectRow = {
  slug: string;
  name: string;
  level: AccessLevel;
  hasDemo: boolean;
  guestCount: number;
};

export type GuestFilters = {
  project?: string;
  status?: 'active' | 'paused' | 'expired';
};

const WEEK_MS = 7 * 86_400_000;
const LIST_LIMIT = 5;
const SEARCH_LIMIT = 8;
const STATUSES = ['active', 'paused', 'expired'] as const;

export async function countPendingRequests(db: Db): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(accessRequests)
    .where(eq(accessRequests.status, 'pending'));
  return row?.count ?? 0;
}

/** Every active, unexpired grant with its guest name and project slug */
async function loadActiveGrants(db: Db, now: Date) {
  const rows = await db
    .select({
      grantId: grants.id,
      guestId: grants.guestId,
      guestName: guests.name,
      projectSlug: grants.productSlug,
      status: grants.status,
      expiresAt: grants.expiresAt,
    })
    .from(grants)
    .innerJoin(guests, eq(guests.id, grants.guestId));
  return rows.filter((row) => isGrantActive(row, now));
}

function countBySlug(rows: Array<{ projectSlug: string }>) {
  const counts = new Map<string, number>();
  for (const { projectSlug } of rows) {
    counts.set(projectSlug, (counts.get(projectSlug) ?? 0) + 1);
  }
  return counts;
}

export async function getOverview(
  db: Db,
  now: Date,
): Promise<{
  stats: OverviewStats;
  waiting: PendingRequest[];
  expiring: ExpiringGrant[];
  protected: ProtectedProjectRow[];
}> {
  const [levels, projects, active, waitingCount, waiting] = await Promise.all([
    getStoredLevels(db),
    getAllProjects(),
    loadActiveGrants(db, now),
    countPendingRequests(db),
    db
      .select()
      .from(accessRequests)
      .where(eq(accessRequests.status, 'pending'))
      .orderBy(desc(accessRequests.createdAt))
      .limit(LIST_LIMIT),
  ]);

  const weekEnd = now.getTime() + WEEK_MS;
  const expiringAll = active
    .filter(
      (row): row is typeof row & { expiresAt: Date } =>
        row.expiresAt !== null && row.expiresAt.getTime() <= weekEnd,
    )
    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

  const counts = countBySlug(active);
  const protectedRows = projects
    .filter((project) => resolveLevel(project.slug, levels) === 'unlocked')
    .map((project) => ({
      slug: project.slug,
      name: project.name,
      guestCount: counts.get(project.slug) ?? 0,
    }));

  return {
    stats: {
      requestsWaiting: waitingCount,
      protectedProjects: protectedRows.length,
      activeGuests: new Set(active.map((row) => row.guestId)).size,
      expiringThisWeek: expiringAll.length,
    },
    waiting,
    expiring: expiringAll.slice(0, LIST_LIMIT).map((row) => ({
      grantId: row.grantId,
      guestName: row.guestName,
      projectSlug: row.projectSlug,
      expiresAt: row.expiresAt,
    })),
    protected: protectedRows,
  };
}

export async function getProjectRows(
  db: Db,
  now: Date,
): Promise<{ demo: ProjectRow[]; other: ProjectRow[] }> {
  const [levels, projects, active] = await Promise.all([
    getStoredLevels(db),
    getAllProjects(),
    loadActiveGrants(db, now),
  ]);
  const counts = countBySlug(active);
  const rows = projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    level: resolveLevel(project.slug, levels),
    hasDemo: canBeUnlocked(project.slug),
    guestCount: counts.get(project.slug) ?? 0,
  }));
  return {
    demo: rows.filter((row) => row.hasDemo),
    other: rows.filter((row) => !row.hasDemo),
  };
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseGuestFilters(
  params: Record<string, string | string[] | undefined>,
  knownSlugs: string[],
): GuestFilters {
  const project = first(params.project);
  const status = first(params.status);
  const filters: GuestFilters = {};
  if (project && knownSlugs.includes(project)) filters.project = project;
  const matched = STATUSES.find((value) => value === status);
  if (matched) filters.status = matched;
  return filters;
}

export async function getGuestRows(
  db: Db,
  filters: GuestFilters,
  now: Date,
): Promise<GrantView[]> {
  const conditions = [];
  if (filters.project) conditions.push(eq(grants.productSlug, filters.project));
  if (filters.status === 'expired') {
    conditions.push(lte(grants.expiresAt, now));
  } else if (filters.status === 'active') {
    conditions.push(
      eq(grants.status, 'active'),
      or(sql`${grants.expiresAt} is null`, gt(grants.expiresAt, now)),
    );
  } else if (filters.status === 'paused') {
    conditions.push(
      eq(grants.status, 'paused'),
      or(sql`${grants.expiresAt} is null`, gt(grants.expiresAt, now)),
    );
  }

  return db
    .select({
      grantId: grants.id,
      guestId: guests.id,
      name: guests.name,
      email: guests.email,
      note: guests.note,
      productSlug: grants.productSlug,
      status: grants.status,
      expiresAt: grants.expiresAt,
      lastVisitAt: grants.lastVisitAt,
      visitCount: grants.visitCount,
      createdAt: grants.createdAt,
    })
    .from(grants)
    .innerJoin(guests, eq(guests.id, grants.guestId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(guests.name), asc(grants.productSlug));
}

export async function searchGuests(
  db: Db,
  query: string,
): Promise<Array<{ guestId: string; name: string; email: string | null }>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const pattern = `%${trimmed.replace(/[\\%_]/g, '\\$&')}%`;
  return db
    .select({ guestId: guests.id, name: guests.name, email: guests.email })
    .from(guests)
    .where(or(ilike(guests.name, pattern), ilike(guests.email, pattern)))
    .orderBy(asc(guests.name))
    .limit(SEARCH_LIMIT);
}
