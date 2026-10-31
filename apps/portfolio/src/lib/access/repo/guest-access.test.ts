import { readFileSync } from 'node:fs';

import { sql } from 'drizzle-orm';
import { beforeEach, describe, expect, test } from 'vitest';

import type { Db } from '@/lib/db/client';
import { grants, guests, products } from '@/lib/db/schema';
import { createTestDb } from '@/lib/db/test-db';

import {
  findGuestByPassword,
  getGuestPass,
  inviteGuest,
  recordGuestVisit,
  setGuestExpiry,
  setGuestStatus,
} from './guest-access';

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
});

const now = new Date('2026-11-01T00:00:00Z');
const later = (hours: number) => new Date(now.getTime() + hours * 3_600_000);

describe('inviteGuest', () => {
  test('creates one active guest and returns a password', async () => {
    const created = await inviteGuest(db, {
      name: 'Ada',
      email: 'ada@x.com',
      expiresAt: null,
    });
    expect(created.existing).toBe(false);
    expect(await findGuestByPassword(db, created.password, now)).toMatchObject({
      guestId: created.guestId,
    });
  });

  test('the same email in any case renews: new password, old one stops', async () => {
    const first = await inviteGuest(db, {
      name: 'Ada',
      email: 'ada@x.com',
      expiresAt: null,
    });
    await setGuestStatus(db, first.guestId, 'paused');
    const second = await inviteGuest(db, {
      name: 'Ada L',
      email: ' ADA@x.com ',
      expiresAt: later(24),
    });

    expect(second).toMatchObject({ existing: true, guestId: first.guestId });
    expect(await findGuestByPassword(db, first.password, now)).toBeNull();
    expect(await findGuestByPassword(db, second.password, now)).toMatchObject({
      guestId: first.guestId,
    });
  });

  test('a guest without email is always new', async () => {
    const a = await inviteGuest(db, { name: 'A', expiresAt: null });
    const b = await inviteGuest(db, { name: 'A', expiresAt: null });
    expect(a.guestId).not.toBe(b.guestId);
  });
});

describe('access state', () => {
  test('paused or expired guests are not found and their pass is inactive', async () => {
    const { guestId, password } = await inviteGuest(db, {
      name: 'Ada',
      email: 'ada@x.com',
      expiresAt: later(1),
    });
    expect((await getGuestPass(db, guestId, now))?.active).toBe(true);

    expect(await findGuestByPassword(db, password, later(2))).toBeNull();
    expect((await getGuestPass(db, guestId, later(2)))?.active).toBe(false);

    await setGuestExpiry(db, guestId, null);
    await setGuestStatus(db, guestId, 'paused');
    expect(await findGuestByPassword(db, password, now)).toBeNull();
    expect((await getGuestPass(db, guestId, now))?.active).toBe(false);
  });

  test('an unknown guest has no pass', async () => {
    expect(
      await getGuestPass(db, '00000000-0000-0000-0000-000000000000', now),
    ).toBeNull();
  });

  test('recordGuestVisit counts at most once an hour', async () => {
    const { guestId } = await inviteGuest(db, { name: 'A', expiresAt: null });
    await recordGuestVisit(db, guestId, now);
    await recordGuestVisit(db, guestId, later(0.5));
    await recordGuestVisit(db, guestId, later(2));
    const [row] = await db
      .select({ visits: guests.visitCount })
      .from(guests)
      .where(sql`${guests.id} = ${guestId}`);
    expect(row?.visits).toBe(2);
  });
});

describe('carry-over from per-project grants', () => {
  async function carryOver() {
    const file = readFileSync('drizzle/0002_guest_pass.sql', 'utf8');
    const statements = file
      .split('-- carry-over')[1]!
      .split('--> statement-breakpoint')
      .map((statement) => statement.trim())
      .filter(Boolean);
    for (const statement of statements) await db.execute(sql.raw(statement));
  }

  async function guest(name: string) {
    const [row] = await db
      .insert(guests)
      .values({ name, passwordLookup: `lookup-${name}` })
      .returning({ id: guests.id });
    return row!.id;
  }

  async function access(id: string) {
    const [row] = await db
      .select({
        status: guests.accessStatus,
        expiresAt: guests.accessExpiresAt,
      })
      .from(guests)
      .where(sql`${guests.id} = ${id}`);
    return row;
  }

  test('each guest keeps the access their grants gave them', async () => {
    const soon = new Date(Date.now() + 86_400_000);
    const later2 = new Date(Date.now() + 2 * 86_400_000);
    const past = new Date(Date.now() - 86_400_000);
    const older = new Date(Date.now() - 2 * 86_400_000);
    await db.insert(products).values([
      { slug: 'a', level: 'unlocked' },
      { slug: 'b', level: 'unlocked' },
    ]);

    const active = await guest('active');
    const noEnd = await guest('no-end');
    const paused = await guest('paused');
    const expired = await guest('expired');
    const none = await guest('none');
    await db.insert(grants).values([
      { guestId: active, productSlug: 'a', expiresAt: soon },
      { guestId: active, productSlug: 'b', expiresAt: later2 },
      { guestId: noEnd, productSlug: 'a', expiresAt: soon },
      { guestId: noEnd, productSlug: 'b', expiresAt: null },
      { guestId: paused, productSlug: 'a', status: 'paused', expiresAt: soon },
      { guestId: expired, productSlug: 'a', expiresAt: older },
      { guestId: expired, productSlug: 'b', expiresAt: past },
    ]);

    await carryOver();

    expect(await access(active)).toEqual({
      status: 'active',
      expiresAt: later2,
    });
    expect(await access(noEnd)).toEqual({ status: 'active', expiresAt: null });
    expect(await access(paused)).toEqual({ status: 'paused', expiresAt: soon });
    expect(await access(expired)).toEqual({
      status: 'active',
      expiresAt: past,
    });
    expect((await access(none))?.status).toBe('paused');
  });
});
