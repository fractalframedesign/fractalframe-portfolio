import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';

import type { Db } from '@/lib/db/client';
import { guests } from '@/lib/db/schema';

import { isGrantActive } from '../expiry';
import { generatePassKey } from '../passwords';

const HOUR_MS = 3_600_000;

export type AccessStatus = 'active' | 'paused';

export type GuestAccess = {
  guestId: string;
  name: string;
  email: string | null;
  note: string;
  status: AccessStatus;
  expiresAt: Date | null;
  lastVisitAt: Date | null;
  visitCount: number;
  createdAt: Date;
};

export const guestAccessView = {
  guestId: guests.id,
  name: guests.name,
  email: guests.email,
  note: guests.note,
  status: guests.accessStatus,
  expiresAt: guests.accessExpiresAt,
  lastVisitAt: guests.lastVisitAt,
  visitCount: guests.visitCount,
  createdAt: guests.createdAt,
};

export function isAccessActive(
  row: { status: AccessStatus; expiresAt: Date | null },
  now: Date,
) {
  return isGrantActive(row, now);
}

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || null;
}

/**
 * Invites someone, or renews them when their email is already a guest:
 * either way active access and the given expiry. A new guest gets a pass key;
 * a renewed guest keeps theirs, so the devices they signed in on still work.
 */
export async function inviteGuest(
  db: Db,
  input: {
    name: string;
    email?: string;
    note?: string;
    expiresAt: Date | null;
  },
): Promise<{ guestId: string; existing: boolean }> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const note = input.note?.trim() ?? '';
  const access = {
    accessStatus: 'active' as const,
    accessExpiresAt: input.expiresAt,
  };

  return db.transaction(async (tx) => {
    const [existing] = email
      ? await tx.select().from(guests).where(eq(guests.email, email))
      : [];

    if (existing) {
      await tx
        .update(guests)
        .set({
          ...access,
          name: name || existing.name,
          note: note || existing.note,
        })
        .where(eq(guests.id, existing.id));
      return { guestId: existing.id, existing: true };
    }

    const [created] = await tx
      .insert(guests)
      .values({
        name,
        email,
        note,
        passwordLookup: generatePassKey(),
        ...access,
      })
      .returning({ id: guests.id });
    return { guestId: created!.id, existing: false };
  });
}

export async function getGuest(db: Db, guestId: string) {
  const [row] = await db
    .select(guestAccessView)
    .from(guests)
    .where(eq(guests.id, guestId));
  return row;
}

export async function findGuestByEmail(db: Db, email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return undefined;
  const [row] = await db
    .select(guestAccessView)
    .from(guests)
    .where(eq(guests.email, normalized));
  return row;
}

/** For the proxy: the guest's current pass key and whether access is active */
export async function getGuestPass(db: Db, guestId: string, now: Date) {
  const [row] = await db
    .select({
      passwordLookup: guests.passwordLookup,
      status: guests.accessStatus,
      expiresAt: guests.accessExpiresAt,
    })
    .from(guests)
    .where(eq(guests.id, guestId));
  if (!row) return null;
  return {
    passwordLookup: row.passwordLookup,
    active: isAccessActive(row, now),
  };
}

export async function setGuestStatus(
  db: Db,
  guestId: string,
  status: AccessStatus,
) {
  await db
    .update(guests)
    .set({ accessStatus: status })
    .where(eq(guests.id, guestId));
}

export async function setGuestExpiry(
  db: Db,
  guestId: string,
  expiresAt: Date | null,
) {
  await db
    .update(guests)
    .set({ accessExpiresAt: expiresAt })
    .where(eq(guests.id, guestId));
}

/** Access back on with a new end date, in one update; the pass key is unchanged */
export async function resumeAccess(
  db: Db,
  guestId: string,
  expiresAt: Date | null,
) {
  await db
    .update(guests)
    .set({ accessStatus: 'active', accessExpiresAt: expiresAt })
    .where(eq(guests.id, guestId));
}

export async function recordGuestVisit(db: Db, guestId: string, now: Date) {
  await db
    .update(guests)
    .set({ visitCount: sql`${guests.visitCount} + 1`, lastVisitAt: now })
    .where(
      and(
        eq(guests.id, guestId),
        or(
          isNull(guests.lastVisitAt),
          lt(guests.lastVisitAt, new Date(now.getTime() - HOUR_MS)),
        ),
      ),
    );
}
