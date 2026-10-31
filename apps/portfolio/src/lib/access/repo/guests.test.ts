import { beforeEach, expect, test } from 'vitest';

import type { Db } from '@/lib/db/client';
import { createTestDb } from '@/lib/db/test-db';

import { findGuestByPassword, getGuest, inviteGuest } from './guest-access';
import { deleteGuest, resetPassword, updateGuest } from './guests';

const NOW = new Date('2026-11-01T00:00:00Z');

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
});

test('resetPassword invalidates the old password', async () => {
  const { guestId, password } = await inviteGuest(db, {
    name: 'Ada',
    expiresAt: null,
  });
  const next = await resetPassword(db, guestId);
  expect(next).not.toBe(password);
  expect(await findGuestByPassword(db, password, NOW)).toBeNull();
  expect(await findGuestByPassword(db, next, NOW)).not.toBeNull();
});

test('resetPassword for an unknown guest throws', async () => {
  await expect(
    resetPassword(db, '00000000-0000-0000-0000-000000000000'),
  ).rejects.toThrow('Guest not found');
});

test('updateGuest trims and changes only what is given', async () => {
  const { guestId } = await inviteGuest(db, {
    name: 'Ada',
    note: 'old',
    expiresAt: null,
  });
  await updateGuest(db, guestId, { note: '  friend ' });
  expect(await getGuest(db, guestId)).toMatchObject({
    name: 'Ada',
    note: 'friend',
  });
});

test('deleteGuest removes them and their password', async () => {
  const { guestId, password } = await inviteGuest(db, {
    name: 'Ada',
    expiresAt: null,
  });
  await deleteGuest(db, guestId);
  expect(await getGuest(db, guestId)).toBeUndefined();
  expect(await findGuestByPassword(db, password, NOW)).toBeNull();
});
