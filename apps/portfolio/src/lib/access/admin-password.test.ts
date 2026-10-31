import { beforeEach, describe, expect, test } from 'vitest';

import type { Db } from '@/lib/db/client';
import { createTestDb } from '@/lib/db/test-db';

import {
  changeAdminPassword,
  checkAdminLogin,
  isSessionCurrent,
} from './admin-password';

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
});

const changedAt = new Date('2026-11-01T10:00:00Z');

describe('checkAdminLogin', () => {
  test('uses ADMIN_PASSWORD until a password is set in the console', async () => {
    expect(await checkAdminLogin(db, 'test-admin-password')).toBe(true);
    expect(await checkAdminLogin(db, 'nope')).toBe(false);
  });

  test('after a change only the new password works', async () => {
    await changeAdminPassword(db, 'a brand new password', changedAt);
    expect(await checkAdminLogin(db, 'a brand new password')).toBe(true);
    expect(await checkAdminLogin(db, 'test-admin-password')).toBe(false);
  });
});

describe('isSessionCurrent', () => {
  test('every valid session is current before any change', async () => {
    expect(await isSessionCurrent(db, new Date(0))).toBe(true);
  });

  test('sessions from before the change are not current', async () => {
    await changeAdminPassword(db, 'a brand new password', changedAt);
    expect(await isSessionCurrent(db, new Date(changedAt.getTime() - 1))).toBe(
      false,
    );
    expect(await isSessionCurrent(db, changedAt)).toBe(true);
  });
});
