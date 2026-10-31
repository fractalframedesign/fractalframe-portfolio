import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createGuest } from '@/lib/access/repo/guests';
import { seedProducts } from '@/lib/access/repo/products';
import { listPendingRequests } from '@/lib/access/repo/requests';
import type { Db } from '@/lib/db/client';
import { createTestDb } from '@/lib/db/test-db';
import { accessCookieName, guestCookieName } from '@/lib/showcase-access';

import { unlock } from './actions';
import { requestAccess } from './request-access';

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  dbDown: false,
  cookies: new Map<string, string>(),
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
  }),
  headers: async () =>
    new Headers({ 'x-forwarded-for': `${state.ip}, 10.0.0.1` }),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const SLUG = 'fintech-components';

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function unlockWith(password: string) {
  return unlock(
    {},
    form({ project: SLUG, password, next: `/showcase/${SLUG}/docs` }),
  );
}

beforeEach(async () => {
  const db: Db = await createTestDb();
  await seedProducts(db);
  state.db = db;
  state.dbDown = false;
  state.cookies.clear();
  delete process.env.SHOWCASE_ACCESS;
  delete process.env.RESEND_API_KEY;
  vi.unstubAllGlobals();
});

describe('unlock', () => {
  test('a guest password sets the guest cookie and redirects', async () => {
    const { password } = await createGuest(state.db as Db, {
      name: 'Ada',
      products: [SLUG],
      expiresAt: null,
      source: 'manual',
    });
    await expect(unlockWith(password)).rejects.toThrow(
      `REDIRECT:/showcase/${SLUG}/docs`,
    );
    expect(state.cookies.get(guestCookieName(SLUG))).toMatch(
      /^[0-9a-f-]{36}\.[0-9a-f]{64}$/,
    );
  });

  test('projects that are not Unlocked need no password', async () => {
    expect(await unlock({}, form({ project: 'bloom', password: 'x' }))).toEqual(
      { error: 'This project doesn’t need a password.' },
    );
  });

  test('unlock reports outage, still accepts fallback', async () => {
    state.dbDown = true;
    expect(await unlockWith('wrong')).toEqual({
      error:
        'We can’t check passwords right now. Please try again in a few minutes.',
    });

    process.env.SHOWCASE_ACCESS = 'kiran:open-sesame:*';
    await expect(unlockWith('open-sesame')).rejects.toThrow(
      `REDIRECT:/showcase/${SLUG}/docs`,
    );
    expect(state.cookies.get(accessCookieName(SLUG))).toMatch(/^[0-9a-f]{64}$/);
  });

  test('unlock locks after 5 wrong passwords', async () => {
    process.env.SHOWCASE_ACCESS = 'kiran:open-sesame:*';
    for (let i = 0; i < 5; i++)
      expect(await unlockWith('wrong')).toEqual({
        error: 'That password isn’t right. Try again.',
      });
    expect(await unlockWith('open-sesame')).toEqual({
      error: 'Too many tries. Try again in 15 minutes.',
    });

    state.ip = '198.51.100.1';
    await expect(unlockWith('open-sesame')).rejects.toThrow('REDIRECT:');
    state.ip = '203.0.113.7';
  });
});

describe('requestAccess', () => {
  const request = () =>
    requestAccess(
      {},
      form({
        project: SLUG,
        name: 'Ada',
        email: 'ada@example.com',
        message: 'Hi',
      }),
    );

  test('request succeeds when only one of save/email works', async () => {
    // No RESEND_API_KEY: email fails, save works
    expect(await request()).toEqual({ sent: true });
    expect(await listPendingRequests(state.db as Db)).toHaveLength(1);

    // Database down, email works
    state.dbDown = true;
    process.env.RESEND_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await request()).toEqual({ sent: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test('request fails only when both save and email fail', async () => {
    state.dbDown = true;
    process.env.RESEND_API_KEY = 'test-key';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    );
    expect(await request()).toMatchObject({
      error: 'Your request didn’t send. Please try again.',
    });
  });

  test('requests for projects that are not Unlocked are refused', async () => {
    expect(
      await requestAccess(
        {},
        form({ project: 'bloom', name: 'Ada', email: 'ada@example.com' }),
      ),
    ).toEqual({ error: 'This project doesn’t need a password.' });
    expect(await listPendingRequests(state.db as Db)).toHaveLength(0);
  });
});
