import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createTestDb } from '@/lib/db/test-db';

import { changeAdminPassword } from './admin-password';
import { ADMIN_COOKIE, createAdminSession } from './admin-session';
import { requireAdmin } from './require-admin';

const state = vi.hoisted(() => ({
  token: undefined as string | undefined,
  db: undefined as unknown,
  dbDown: false,
}));

vi.mock('@/lib/db/client', () => ({
  getDb: () => {
    if (state.dbDown) throw new Error('DATABASE_URL is not set');
    return state.db;
  },
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'admin-session' && state.token
        ? { name, value: state.token }
        : undefined,
  }),
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

beforeEach(async () => {
  state.token = undefined;
  state.db = await createTestDb();
  state.dbDown = false;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('requireAdmin', () => {
  test('redirects to login without a session', async () => {
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/admin/login');
    state.token = 'garbage';
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/admin/login');
  });

  test('passes with a valid session', async () => {
    state.token = await createAdminSession(new Date());
    await expect(requireAdmin()).resolves.toMatchObject({ rememberMe: false });
    expect(ADMIN_COOKIE).toBe('admin-session');
  });

  test('a session from before a password change is signed out', async () => {
    const now = Date.now();
    state.token = await createAdminSession(new Date(now - 60_000));
    await changeAdminPassword(
      state.db as never,
      'a brand new password',
      new Date(now),
    );
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/admin/login');

    state.token = await createAdminSession(new Date(now));
    await expect(requireAdmin()).resolves.toBeTruthy();
  });

  test('with the database down a signed session still passes', async () => {
    state.dbDown = true;
    state.token = await createAdminSession(new Date());
    await expect(requireAdmin()).resolves.toBeTruthy();
  });
});
