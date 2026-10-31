import { beforeEach, describe, expect, test, vi } from 'vitest';

import { changeAdminPassword } from '@/lib/access/admin-password';
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/access/admin-session';
import { createTestDb } from '@/lib/db/test-db';

import { login, logout } from './actions';

const delay = vi.hoisted(() => vi.fn(async (_ms: number) => {}));

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  dbDown: false,
  cookies: new Map<string, string>(),
  deleted: [] as string[],
  ip: '203.0.113.7',
}));

vi.mock('@/lib/db/client', () => ({
  getDb: () => {
    if (state.dbDown) throw new Error('DATABASE_URL is not set');
    return state.db;
  },
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    set: (name: string, value: string) => state.cookies.set(name, value),
    delete: (name: string) => state.deleted.push(name),
  }),
  headers: async () =>
    new Headers({ 'x-forwarded-for': `${state.ip}, 10.0.0.1` }),
}));

vi.mock('@/lib/access/login-delay', () => ({ loginDelay: delay }));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

function loginWith(password: string) {
  const data = new FormData();
  data.set('password', password);
  return login({}, data);
}

beforeEach(async () => {
  state.db = await createTestDb();
  state.dbDown = false;
  state.cookies.clear();
  state.deleted = [];
  delay.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('login', () => {
  test('right password sets a valid session cookie and redirects', async () => {
    await expect(loginWith('test-admin-password')).rejects.toThrow(
      'REDIRECT:/admin',
    );
    const token = state.cookies.get(ADMIN_COOKIE);
    expect(await verifyAdminSession(token, new Date())).toBe(true);
    expect(delay).not.toHaveBeenCalled();
  });

  test('wrong password returns the error, waits 1s and counts', async () => {
    expect(await loginWith('nope')).toEqual({
      error: 'That password isn’t right.',
    });
    expect(delay).toHaveBeenCalledWith(1000);
    expect(state.cookies.has(ADMIN_COOKIE)).toBe(false);
  });

  test('the 6th try within 15 minutes is locked even with the right password', async () => {
    for (let i = 0; i < 5; i++) await loginWith('nope');
    expect(await loginWith('test-admin-password')).toEqual({
      error: 'Too many tries. Try again in 15 minutes.',
    });
    expect(state.cookies.has(ADMIN_COOKIE)).toBe(false);

    state.ip = '198.51.100.1';
    await expect(loginWith('test-admin-password')).rejects.toThrow(
      'REDIRECT:/admin',
    );
  });

  test('a good login clears earlier failures', async () => {
    for (let i = 0; i < 4; i++) await loginWith('nope');
    await expect(loginWith('test-admin-password')).rejects.toThrow('REDIRECT:');
    for (let i = 0; i < 4; i++) await loginWith('nope');
    await expect(loginWith('test-admin-password')).rejects.toThrow('REDIRECT:');
  });

  test('with the database down, every login is refused', async () => {
    state.dbDown = true;
    const unavailable = {
      error: 'Can’t check your password right now. Try again in a minute.',
    };
    expect(await loginWith('nope')).toEqual(unavailable);
    expect(await loginWith('test-admin-password')).toEqual(unavailable);
    expect(state.cookies.has(ADMIN_COOKIE)).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  test('after a password change in the console, only the new one works', async () => {
    await changeAdminPassword(
      state.db as never,
      'a brand new password',
      new Date(),
    );
    expect(await loginWith('test-admin-password')).toEqual({
      error: 'That password isn’t right.',
    });
    await expect(loginWith('a brand new password')).rejects.toThrow(
      'REDIRECT:/admin',
    );
  });

  test('empty password is rejected', async () => {
    expect(await loginWith('')).toEqual({
      error: 'That password isn’t right.',
    });
  });
});

describe('logout', () => {
  test('clears the cookie and redirects to login', async () => {
    await expect(logout()).rejects.toThrow('REDIRECT:/admin/login');
    expect(state.deleted).toContain(ADMIN_COOKIE);
  });
});
