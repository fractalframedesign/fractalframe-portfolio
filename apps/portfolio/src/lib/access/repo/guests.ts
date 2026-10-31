import { eq } from 'drizzle-orm';

import type { Db } from '@/lib/db/client';
import { guests } from '@/lib/db/schema';

import { generatePassword, passwordLookup } from '../passwords';

// Access itself (invite, pause, expiry, the guest pass) lives in guest-access.ts.
// The per-project `grants` table is kept for selling products later.

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

/** A new password; the old one and every pass signed with it stop working */
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
