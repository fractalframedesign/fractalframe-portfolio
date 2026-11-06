import { beforeEach, describe, expect, test } from 'vitest';

import type { Db } from '@/lib/db/client';
import { createTestDb } from '@/lib/db/test-db';

import { getAdminAccount, setAdminPassword } from './admin-account';

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
});

describe('admin account', () => {
  test('is empty until a password is set', async () => {
    expect(await getAdminAccount(db)).toBeUndefined();
  });

  test('setting twice keeps one row with the latest values', async () => {
    await setAdminPassword(db, 'hash-1', new Date('2026-11-01T00:00:00Z'));
    const changedAt = new Date('2026-11-02T00:00:00.123Z');
    await setAdminPassword(db, 'hash-2', changedAt);

    expect(await getAdminAccount(db)).toEqual({
      passwordHash: 'hash-2',
      passwordChangedAt: changedAt,
    });
  });
});
