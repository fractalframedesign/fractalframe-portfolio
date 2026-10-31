import { and, asc, desc, eq, gt, ilike, lte, or, sql } from 'drizzle-orm';

import type { Db } from '@/lib/db/client';
import { accessRequests, guests } from '@/lib/db/schema';
import { getAllProjects } from '@/lib/projects';

import { type AccessLevel, resolveLevel } from './levels';
import {
  type GuestAccess,
  guestAccessView,
  isAccessActive,
} from './repo/guest-access';
import { getStoredLevels } from './repo/products';

export type PendingRequest = typeof accessRequests.$inferSelect;

/** A pending request, and the guest it belongs to when the email is known */
export type RequestRow = PendingRequest & {
  existingGuest: {
    guestId: string;
    expiresAt: Date | null;
    state: 'active' | 'paused' | 'expired';
  } | null;
};

export type OverviewStats = {
  requestsWaiting: number;
  protectedProjects: number;
  activeGuests: number;
  expiringThisWeek: number;
};

export type ExpiringGuest = {
  guestId: string;
  guestName: string;
  expiresAt: Date;
};

export type ProtectedProjectRow = { slug: string; name: string };

export type ProjectRow = { slug: string; name: string; level: AccessLevel };

export type GuestFilters = { status?: 'active' | 'paused' | 'expired' };

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

/** Every guest whose access is active and unexpired */
async function loadActiveGuests(db: Db, now: Date) {
  const rows = await db.select(guestAccessView).from(guests);
  return rows.filter((row) => isAccessActive(row, now));
}

async function attachGuests(
  db: Db,
  requests: PendingRequest[],
  now: Date,
): Promise<RequestRow[]> {
  const emails = [...new Set(requests.map((request) => request.email))];
  const known = emails.length
    ? await db
        .select({
          guestId: guests.id,
          email: guests.email,
          expiresAt: guests.accessExpiresAt,
          status: guests.accessStatus,
        })
        .from(guests)
        .where(
          sql`lower(trim(${guests.email})) in (${sql.join(
            emails.map((email) => sql`${email.trim().toLowerCase()}`),
            sql`, `,
          )})`,
        )
    : [];
  const byEmail = new Map(
    known.map((guest) => [guest.email!.trim().toLowerCase(), guest]),
  );

  return requests.map((request) => {
    const guest = byEmail.get(request.email.trim().toLowerCase());
    return {
      ...request,
      existingGuest: guest
        ? {
            guestId: guest.guestId,
            expiresAt: guest.expiresAt,
            // Expired wins over paused, as on the Guests page
            state:
              guest.expiresAt && guest.expiresAt.getTime() <= now.getTime()
                ? 'expired'
                : guest.status,
          }
        : null,
    };
  });
}

async function pendingRequests(db: Db, limit?: number) {
  const query = db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.status, 'pending'))
    .orderBy(desc(accessRequests.createdAt));
  return limit ? query.limit(limit) : query;
}

/** Pending requests, newest first, each marked when it's from an existing guest */
export async function listRequestsWithGuests(
  db: Db,
  now: Date,
): Promise<RequestRow[]> {
  return attachGuests(db, await pendingRequests(db), now);
}

export async function getOverview(
  db: Db,
  now: Date,
): Promise<{
  stats: OverviewStats;
  waiting: RequestRow[];
  expiring: ExpiringGuest[];
  protected: ProtectedProjectRow[];
}> {
  const [levels, projects, active, waitingCount, waiting] = await Promise.all([
    getStoredLevels(db),
    getAllProjects(),
    loadActiveGuests(db, now),
    countPendingRequests(db),
    pendingRequests(db, LIST_LIMIT),
  ]);

  const weekEnd = now.getTime() + WEEK_MS;
  const expiringAll = active
    .filter(
      (row): row is GuestAccess & { expiresAt: Date } =>
        row.expiresAt !== null && row.expiresAt.getTime() <= weekEnd,
    )
    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

  const protectedRows = projects
    .filter((project) => resolveLevel(project.slug, levels) === 'unlocked')
    .map(({ slug, name }) => ({ slug, name }));

  return {
    stats: {
      requestsWaiting: waitingCount,
      protectedProjects: protectedRows.length,
      activeGuests: active.length,
      expiringThisWeek: expiringAll.length,
    },
    waiting: await attachGuests(db, waiting, now),
    expiring: expiringAll.slice(0, LIST_LIMIT).map((row) => ({
      guestId: row.guestId,
      guestName: row.name,
      expiresAt: row.expiresAt,
    })),
    protected: protectedRows,
  };
}

/** Every project with its access level, in content order */
export async function getProjectRows(db: Db): Promise<ProjectRow[]> {
  const [levels, projects] = await Promise.all([
    getStoredLevels(db),
    getAllProjects(),
  ]);
  return projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    level: resolveLevel(project.slug, levels),
  }));
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseGuestFilters(
  params: Record<string, string | string[] | undefined>,
): GuestFilters {
  const status = first(params.status);
  const matched = STATUSES.find((value) => value === status);
  return matched ? { status: matched } : {};
}

// craftsman-ignore PARAM001: three parameters (db, filters, now); the hook miscounts
/** One row per person; expired wins over paused */
export async function getGuestRows(
  db: Db,
  filters: GuestFilters,
  now: Date,
): Promise<GuestAccess[]> {
  const unexpired = or(
    sql`${guests.accessExpiresAt} is null`,
    gt(guests.accessExpiresAt, now),
  );
  const conditions = {
    expired: lte(guests.accessExpiresAt, now),
    active: and(eq(guests.accessStatus, 'active'), unexpired),
    paused: and(eq(guests.accessStatus, 'paused'), unexpired),
  };

  return db
    .select(guestAccessView)
    .from(guests)
    .where(filters.status ? conditions[filters.status] : undefined)
    .orderBy(asc(guests.name));
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
