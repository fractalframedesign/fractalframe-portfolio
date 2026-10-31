import { describe, expect, test } from 'vitest';

import {
  ADMIN_COOKIE,
  adminCookieOptions,
  checkAdminPassword,
  createAdminSession,
  verifyAdminSession,
} from './admin-session';

const now = new Date('2026-10-31T00:00:00Z');
const minutes = (n: number) => new Date(now.getTime() + n * 60_000);

describe('admin session', () => {
  test('valid at +11h59m, invalid at +12h01m', async () => {
    const token = await createAdminSession(now);
    expect(await verifyAdminSession(token, minutes(11 * 60 + 59))).toBe(true);
    expect(await verifyAdminSession(token, minutes(12 * 60 + 1))).toBe(false);
  });

  test('tampered, malformed or missing is invalid', async () => {
    const token = await createAdminSession(now);
    const [exp, sig] = token.split('.');
    expect(
      await verifyAdminSession(`${Number(exp) + 3_600_000}.${sig}`, now),
    ).toBe(false);
    const flipped = sig!.slice(0, -1) + (sig!.endsWith('0') ? '1' : '0');
    expect(await verifyAdminSession(`${exp}.${flipped}`, now)).toBe(false);
    expect(await verifyAdminSession('garbage', now)).toBe(false);
    expect(await verifyAdminSession(undefined, now)).toBe(false);
  });

  test('checkAdminPassword', () => {
    expect(ADMIN_COOKIE).toBe('admin-session');
    expect(checkAdminPassword('test-admin-password')).toBe(true);
    expect(checkAdminPassword('nope')).toBe(false);
    const prev = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    expect(checkAdminPassword('')).toBe(false);
    expect(checkAdminPassword('anything')).toBe(false);
    process.env.ADMIN_PASSWORD = prev;
  });

  test('cookie options', () => {
    expect(adminCookieOptions()).toEqual({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 43200,
    });
  });
});
