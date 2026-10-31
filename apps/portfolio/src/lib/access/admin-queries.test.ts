import { expect, test } from 'vitest';

import { inviteGuest, setGuestStatus } from '@/lib/access/repo/guest-access';
import { seedProducts, setLevel } from '@/lib/access/repo/products';
import { saveRequest } from '@/lib/access/repo/requests';
import { createTestDb } from '@/lib/db/test-db';

import {
  countPendingRequests,
  getGuestRows,
  getOverview,
  getProjectRows,
  listRequestsWithGuests,
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

test('active guests are people, however many projects are locked', async () => {
  const db = await setup();
  await setLevel(db, 'finance-dashboard', 'unlocked');
  await setLevel(db, 'bloom', 'unlocked');
  await inviteGuest(db, { name: 'Ada', email: 'ada@x.com', expiresAt: null });
  const paused = await inviteGuest(db, { name: 'Bo', expiresAt: null });
  await setGuestStatus(db, paused.guestId, 'paused');

  const { stats } = await getOverview(db, now);
  expect(stats.activeGuests).toBe(1);
});

test('expiring this week: active people ending within 7 days', async () => {
  const db = await setup();
  const make = (name: string, expiresAt: Date | null) =>
    inviteGuest(db, { name, expiresAt });
  await make('Soon', inDays(2));
  await make('Sooner', inDays(1));
  await make('Never', null);
  await make('Later', inDays(8));
  const paused = await make('Paused', inDays(3));
  await setGuestStatus(db, paused.guestId, 'paused');

  const { stats, expiring } = await getOverview(db, now);
  expect(stats.expiringThisWeek).toBe(2);
  expect(expiring.map((row) => row.guestName)).toEqual(['Sooner', 'Soon']);
});

test('protected projects are listed by name', async () => {
  const db = await setup();
  await setLevel(db, 'bloom', 'unlocked');
  const { stats, protected: rows } = await getOverview(db, now);
  expect(rows.map((row) => row.slug)).toContain('bloom');
  expect(stats.protectedProjects).toBe(rows.length);
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

test('requests say when the email is already a guest, in any case', async () => {
  const db = await setup();
  const { guestId } = await inviteGuest(db, {
    name: 'Ada',
    email: 'ada@x.com',
    expiresAt: inDays(3),
  });
  await saveRequest(db, {
    name: 'Ada',
    email: 'ADA@x.com',
    message: '',
    productSlug: 'bloom',
  });
  await saveRequest(db, {
    name: 'Bo',
    email: 'bo@x.com',
    message: '',
    productSlug: 'bloom',
  });

  const rows = await listRequestsWithGuests(db, now);
  const byName = new Map(rows.map((row) => [row.name, row.existingGuest]));
  expect(byName.get('Ada')).toEqual({
    guestId,
    expiresAt: inDays(3),
    state: 'active',
  });
  expect(byName.get('Bo')).toBeNull();

  await setGuestStatus(db, guestId, 'paused');
  const [paused] = (await listRequestsWithGuests(db, now)).filter(
    (row) => row.name === 'Ada',
  );
  expect(paused?.existingGuest?.state).toBe('paused');
  expect(
    (await listRequestsWithGuests(db, inDays(4))).find(
      (row) => row.name === 'Ada',
    )?.existingGuest?.state,
  ).toBe('expired');
});

test('getProjectRows lists every project with its level', async () => {
  const db = await setup();
  await setLevel(db, 'bloom', 'unlocked');
  const rows = await getProjectRows(db);
  expect(rows.find((row) => row.slug === 'bloom')?.level).toBe('unlocked');
  expect(rows.length).toBe(17);
});

test('getGuestRows filters people by status', async () => {
  const db = await setup();
  await inviteGuest(db, { name: 'Active', expiresAt: null });
  await inviteGuest(db, { name: 'Expired', expiresAt: inDays(-1) });
  const paused = await inviteGuest(db, { name: 'Paused', expiresAt: null });
  await setGuestStatus(db, paused.guestId, 'paused');
  // Paused and expired counts as expired, not paused
  const both = await inviteGuest(db, { name: 'Both', expiresAt: inDays(-1) });
  await setGuestStatus(db, both.guestId, 'paused');

  const names = async (status?: 'active' | 'paused' | 'expired') =>
    (await getGuestRows(db, status ? { status } : {}, now)).map(
      (row) => row.name,
    );
  expect(await names()).toEqual(['Active', 'Both', 'Expired', 'Paused']);
  expect(await names('active')).toEqual(['Active']);
  expect(await names('paused')).toEqual(['Paused']);
  expect(await names('expired')).toEqual(['Both', 'Expired']);
});

test('ignores unknown filters', () => {
  expect(parseGuestFilters({ status: 'weird' })).toEqual({});
  expect(parseGuestFilters({ status: 'paused' })).toEqual({
    status: 'paused',
  });
});

test('searchGuests treats % literally', async () => {
  const db = await setup();
  await inviteGuest(db, { name: '50% off', expiresAt: null });
  await inviteGuest(db, { name: 'Anna', expiresAt: null });
  expect(await searchGuests(db, '%')).toEqual([]);
  const hits = await searchGuests(db, '0%');
  expect(hits.map((h) => h.name)).toEqual(['50% off']);
});
