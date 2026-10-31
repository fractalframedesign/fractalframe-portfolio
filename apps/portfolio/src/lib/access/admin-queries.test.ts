import { expect, test } from 'vitest';

import {
  createGuest,
  setGrantExpiry,
  setGrantStatus,
} from '@/lib/access/repo/guests';
import { seedProducts, setLevel } from '@/lib/access/repo/products';
import { saveRequest } from '@/lib/access/repo/requests';
import { grants } from '@/lib/db/schema';
import { createTestDb } from '@/lib/db/test-db';
import { showcaseProjects } from '@/lib/showcase';

import {
  countPendingRequests,
  getGuestRows,
  getOverview,
  getProjectRows,
  parseGuestFilters,
  searchGuests,
} from './admin-queries';

const now = new Date('2026-11-01T00:00:00Z');
const day = 86_400_000;
const inDays = (n: number) => new Date(now.getTime() + n * day);

async function setup() {
  const db = await createTestDb();
  await seedProducts(db);
  return db;
}

async function grantIds(db: Awaited<ReturnType<typeof setup>>) {
  const rows = await db.select().from(grants);
  return rows.map((r) => r.id);
}

test('stats count guests once across projects', async () => {
  const db = await setup();
  await setLevel(db, 'finance-dashboard', 'unlocked');
  await createGuest(db, {
    name: 'Ada',
    email: 'ada@example.com',
    products: ['fintech-components', 'finance-dashboard'],
    expiresAt: null,
    source: 'manual',
  });
  const { stats } = await getOverview(db, now);
  expect(stats.activeGuests).toBe(1);
});

test('expiring this week excludes paused, never and 8-day grants', async () => {
  const db = await setup();
  const make = (name: string, expiresAt: Date | null) =>
    createGuest(db, {
      name,
      products: ['fintech-components'],
      expiresAt,
      source: 'manual',
    });
  await make('Soon', inDays(3));
  const paused = await make('Paused', inDays(3));
  await make('Never', null);
  await make('Later', inDays(8));
  const all = await db.select().from(grants);
  await setGrantStatus(
    db,
    all.find((g) => g.guestId === paused.guestId)!.id,
    'paused',
  );

  const { stats, expiring } = await getOverview(db, now);
  expect(stats.expiringThisWeek).toBe(1);
  expect(expiring).toHaveLength(1);
  expect(expiring[0]!.guestName).toBe('Soon');
});

test('protected projects list guest counts', async () => {
  const db = await setup();
  const mk = (name: string, expiresAt: Date | null) =>
    createGuest(db, {
      name,
      products: ['fintech-components'],
      expiresAt,
      source: 'manual',
    });
  await mk('A', null);
  await mk('B', inDays(2));
  await mk('C', inDays(-1));
  const { protected: rows, stats } = await getOverview(db, now);
  expect(rows).toEqual([
    expect.objectContaining({ slug: 'fintech-components', guestCount: 2 }),
  ]);
  expect(stats.protectedProjects).toBe(1);
});

test('overview lists newest 5 waiting requests', async () => {
  const db = await setup();
  for (let i = 0; i < 6; i++) {
    await saveRequest(db, {
      name: `R${i}`,
      email: `r${i}@example.com`,
      message: '',
      productSlug: 'fintech-components',
    });
  }
  const { stats, waiting } = await getOverview(db, now);
  expect(stats.requestsWaiting).toBe(6);
  expect(waiting).toHaveLength(5);
  expect(await countPendingRequests(db)).toBe(6);
});

test('getProjectRows splits demo projects', async () => {
  const db = await setup();
  const { demo, other } = await getProjectRows(db, now);
  expect(demo.map((p) => p.slug).sort()).toEqual(
    showcaseProjects.map((p) => p.slug).sort(),
  );
  expect(other.map((p) => p.slug)).toContain('bloom');
});

test('getGuestRows filters by status expired', async () => {
  const db = await setup();
  await createGuest(db, {
    name: 'Old',
    products: ['fintech-components'],
    expiresAt: inDays(-1),
    source: 'manual',
  });
  await createGuest(db, {
    name: 'Live',
    products: ['fintech-components'],
    expiresAt: null,
    source: 'manual',
  });
  const expired = await getGuestRows(db, { status: 'expired' }, now);
  expect(expired.map((r) => r.name)).toEqual(['Old']);
  const active = await getGuestRows(db, { status: 'active' }, now);
  expect(active.map((r) => r.name)).toEqual(['Live']);
});

test('getGuestRows filters by project and paused', async () => {
  const db = await setup();
  await setLevel(db, 'finance-dashboard', 'unlocked');
  await createGuest(db, {
    name: 'A',
    products: ['fintech-components'],
    expiresAt: null,
    source: 'manual',
  });
  await createGuest(db, {
    name: 'B',
    products: ['finance-dashboard'],
    expiresAt: null,
    source: 'manual',
  });
  const rows = await getGuestRows(db, { project: 'finance-dashboard' }, now);
  expect(rows.map((r) => r.name)).toEqual(['B']);
  const [id] = await grantIds(db);
  await setGrantStatus(db, id!, 'paused');
  await setGrantExpiry(db, id!, null);
  const paused = await getGuestRows(db, { status: 'paused' }, now);
  expect(paused).toHaveLength(1);
});

test('ignores unknown filters', () => {
  expect(
    parseGuestFilters({ project: 'nope', status: 'weird' }, ['a']),
  ).toEqual({});
  expect(parseGuestFilters({ project: 'a', status: 'paused' }, ['a'])).toEqual({
    project: 'a',
    status: 'paused',
  });
});

test('searchGuests treats % literally', async () => {
  const db = await setup();
  await createGuest(db, {
    name: '50% off',
    products: [],
    expiresAt: null,
    source: 'manual',
  });
  await createGuest(db, {
    name: 'Anna',
    products: [],
    expiresAt: null,
    source: 'manual',
  });
  expect(await searchGuests(db, '%')).toEqual([]);
  const hits = await searchGuests(db, '0%');
  expect(hits.map((h) => h.name)).toEqual(['50% off']);
});

test('a paused and expired grant shows under expired, not paused', async () => {
  const db = await setup();
  await createGuest(db, {
    name: 'Both',
    products: ['fintech-components'],
    expiresAt: inDays(-1),
    source: 'manual',
  });
  const [id] = await grantIds(db);
  await setGrantStatus(db, id!, 'paused');
  const expired = await getGuestRows(db, { status: 'expired' }, now);
  const paused = await getGuestRows(db, { status: 'paused' }, now);
  expect(expired.map((r) => r.name)).toEqual(['Both']);
  expect(paused).toEqual([]);
});
