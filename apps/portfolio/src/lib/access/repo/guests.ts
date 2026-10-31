import { and, asc, eq, isNull, lt, or, sql } from 'drizzle-orm';

import type { Db } from '@/lib/db/client';
import { grants, guests, products } from '@/lib/db/schema';

import { isGrantActive } from '../expiry';
import { resolveLevel } from '../levels';
import { generatePassword, passwordLookup } from '../passwords';
import { getStoredLevels } from './products';

const HOUR_MS = 3_600_000;

export type GrantView = {
  grantId: string;
  guestId: string;
  name: string;
  email: string | null;
  note: string;
  productSlug: string;
  status: 'active' | 'paused';
  expiresAt: Date | null;
  lastVisitAt: Date | null;
  visitCount: number;
  createdAt: Date;
};

const grantView = {
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
};

export async function createGuest(
  db: Db,
  input: {
    name: string;
    email?: string;
    note?: string;
    products: string[];
    expiresAt: Date | null;
    source: 'manual' | 'request';
  },
): Promise<{ guestId: string; password: string; rotated: boolean }> {
  const email = input.email?.trim().toLowerCase() || null;
  const name = input.name.trim();
  const note = input.note?.trim() ?? '';

  return db.transaction(async (tx) => {
    const levels = await getStoredLevels(tx);
    for (const slug of input.products) {
      if (resolveLevel(slug, levels) !== 'unlocked') {
        throw new Error("Project isn't Unlocked");
      }
    }

    const password = generatePassword();
    const lookup = await passwordLookup(password);

    const [existing] = email
      ? await tx.select().from(guests).where(eq(guests.email, email))
      : [];

    let guestId: string;
    if (existing) {
      guestId = existing.id;
      await tx
        .update(guests)
        .set({
          passwordLookup: lookup,
          name: name || existing.name,
          note: note || existing.note,
        })
        .where(eq(guests.id, guestId));
    } else {
      const [created] = await tx
        .insert(guests)
        .values({ name, email, note, passwordLookup: lookup })
        .returning({ id: guests.id });
      guestId = created!.id;
    }

    for (const productSlug of input.products) {
      await tx
        .insert(grants)
        .values({
          guestId,
          productSlug,
          expiresAt: input.expiresAt,
          source: input.source,
        })
        .onConflictDoUpdate({
          target: [grants.guestId, grants.productSlug],
          set: { status: 'active', expiresAt: input.expiresAt },
        });
    }

    return { guestId, password, rotated: !!existing };
  });
}

export async function findGrantByPassword(
  db: Db,
  slug: string,
  password: string,
  now: Date,
) {
  const lookup = await passwordLookup(password);
  const [row] = await db
    .select({
      grantId: grants.id,
      passwordLookup: guests.passwordLookup,
      status: grants.status,
      expiresAt: grants.expiresAt,
    })
    .from(grants)
    .innerJoin(guests, eq(guests.id, grants.guestId))
    .innerJoin(products, eq(products.slug, grants.productSlug))
    .where(
      and(
        eq(guests.passwordLookup, lookup),
        eq(grants.productSlug, slug),
        eq(products.level, 'unlocked'),
      ),
    );
  if (!row || !isGrantActive(row, now)) return null;
  return { grantId: row.grantId, passwordLookup: row.passwordLookup };
}

export async function getGrantForToken(
  db: Db,
  grantId: string,
  slug: string,
  now: Date,
) {
  const [row] = await db
    .select({
      passwordLookup: guests.passwordLookup,
      status: grants.status,
      expiresAt: grants.expiresAt,
      level: products.level,
    })
    .from(grants)
    .innerJoin(guests, eq(guests.id, grants.guestId))
    .innerJoin(products, eq(products.slug, grants.productSlug))
    .where(and(eq(grants.id, grantId), eq(grants.productSlug, slug)));
  if (!row) return null;
  return {
    passwordLookup: row.passwordLookup,
    active: isGrantActive(row, now) && row.level === 'unlocked',
  };
}

export async function listGrantsByProduct(
  db: Db,
  slug: string,
): Promise<GrantView[]> {
  return db
    .select(grantView)
    .from(grants)
    .innerJoin(guests, eq(guests.id, grants.guestId))
    .where(eq(grants.productSlug, slug))
    .orderBy(asc(grants.createdAt));
}

export async function listGuests(db: Db) {
  const [guestRows, grantRows] = await Promise.all([
    db.select().from(guests).orderBy(asc(guests.createdAt)),
    db
      .select(grantView)
      .from(grants)
      .innerJoin(guests, eq(guests.id, grants.guestId))
      .orderBy(asc(grants.productSlug)),
  ]);
  return guestRows.map((guest) => ({
    guestId: guest.id,
    name: guest.name,
    email: guest.email,
    note: guest.note,
    createdAt: guest.createdAt,
    grants: grantRows.filter((grant) => grant.guestId === guest.id),
  }));
}

export async function setGrantStatus(
  db: Db,
  grantId: string,
  status: 'active' | 'paused',
) {
  await db.update(grants).set({ status }).where(eq(grants.id, grantId));
}

export async function setGrantExpiry(
  db: Db,
  grantId: string,
  expiresAt: Date | null,
) {
  await db.update(grants).set({ expiresAt }).where(eq(grants.id, grantId));
}

export async function addGrant(
  db: Db,
  guestId: string,
  slug: string,
  expiresAt: Date | null,
) {
  await db
    .insert(grants)
    .values({ guestId, productSlug: slug, expiresAt })
    .onConflictDoUpdate({
      target: [grants.guestId, grants.productSlug],
      set: { status: 'active', expiresAt },
    });
}

export async function removeGrant(db: Db, grantId: string) {
  await db.delete(grants).where(eq(grants.id, grantId));
}

export async function deleteGuest(db: Db, guestId: string) {
  await db.delete(guests).where(eq(guests.id, guestId));
}

export async function updateGuest(
  db: Db,
  guestId: string,
  patch: { name?: string; note?: string },
) {
  const set: { name?: string; note?: string } = {};
  if (patch.name !== undefined) set.name = patch.name.trim();
  if (patch.note !== undefined) set.note = patch.note.trim();
  if (Object.keys(set).length === 0) return;
  await db.update(guests).set(set).where(eq(guests.id, guestId));
}

export async function resetPassword(db: Db, guestId: string) {
  return db.transaction(async (tx) => {
    const password = generatePassword();
    const lookup = await passwordLookup(password);
    const updated = await tx
      .update(guests)
      .set({ passwordLookup: lookup })
      .where(eq(guests.id, guestId))
      .returning({ id: guests.id });
    if (updated.length === 0) throw new Error('Guest not found');
    return password;
  });
}

export async function recordVisit(db: Db, grantId: string, now: Date) {
  await db
    .update(grants)
    .set({ visitCount: sql`${grants.visitCount} + 1`, lastVisitAt: now })
    .where(
      and(
        eq(grants.id, grantId),
        or(
          isNull(grants.lastVisitAt),
          lt(grants.lastVisitAt, new Date(now.getTime() - HOUR_MS)),
        ),
      ),
    );
}
