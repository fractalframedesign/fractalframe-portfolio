import { beforeEach, expect, test } from 'vitest';

import type { Db } from '@/lib/db/client';
import { createTestDb } from '@/lib/db/test-db';

import { signGuestPass, verifyGuestPass } from '../passwords';
import { getGuest, getGuestPass, inviteGuest } from './guest-access';
import { deleteGuest, rotatePassKey, updateGuest } from './guests';

const NOW = new Date('2026-11-01T00:00:00Z');

let db: Db;
beforeEach(async () => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret';
  db = await createTestDb();
});

test('rotatePassKey changes the pass key so old cookies stop verifying', async () => {
  const { guestId } = await inviteGuest(db, { name: 'Ada', expiresAt: null });
  const before = (await getGuestPass(db, guestId, NOW))!.passwordLookup;
  const cookie = await signGuestPass(guestId, before);

  await rotatePassKey(db, guestId);

  const after = (await getGuestPass(db, guestId, NOW))!.passwordLookup;
  expect(after).toMatch(/^[0-9a-f]{64}$/);
  expect(after).not.toBe(before);
  expect(await verifyGuestPass(cookie, before)).toBe(true);
  expect(await verifyGuestPass(cookie, after)).toBe(false);
});

test('rotatePassKey for an unknown guest throws', async () => {
  await expect(
    rotatePassKey(db, '00000000-0000-0000-0000-000000000000'),
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

test('deleteGuest removes them and their pass', async () => {
  const { guestId } = await inviteGuest(db, { name: 'Ada', expiresAt: null });
  await deleteGuest(db, guestId);
  expect(await getGuest(db, guestId)).toBeUndefined();
  expect(await getGuestPass(db, guestId, NOW)).toBeNull();
});
