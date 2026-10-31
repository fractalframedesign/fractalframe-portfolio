import { afterEach, describe, expect, test, vi } from 'vitest';

import type { Db } from '@/lib/db/client';
import {
  accessCookieName,
  guestCookieName,
  tokenForPassword,
} from '@/lib/showcase-access';

import { ADMIN_COOKIE, createAdminSession } from './admin-session';
import { type GateDeps, gateRequest, getProxyLevels } from './gate';
import type { AccessLevel } from './levels';
import { signGuestToken } from './passwords';

const NOW = new Date('2026-01-01T12:00:00Z');
const GRANT = '11111111-1111-4111-8111-111111111111';

const levels = new Map<string, AccessLevel>([
  ['bloom', 'public'],
  ['fintech-components', 'unlocked'],
  ['secret', 'admin'],
]);

function deps(overrides: Partial<GateDeps> = {}): GateDeps {
  return {
    getLevels: async () => levels,
    getGrantForToken: async () => null,
    now: () => NOW,
    ...overrides,
  };
}

function cookies(values: Record<string, string> = {}) {
  return { get: (name: string) => values[name] };
}

afterEach(() => {
  delete process.env.SHOWCASE_ACCESS;
});

describe('gateRequest', () => {
  test('unlock page and non-project paths pass through', async () => {
    for (const pathname of ['/showcase/unlock', '/showcase', '/projects'])
      expect(
        await gateRequest({ pathname, cookies: cookies(), deps: deps() }),
      ).toEqual({ kind: 'next' });
  });

  test('public showcase project is allowed', async () => {
    expect(
      await gateRequest({
        pathname: '/showcase/bloom/docs',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'allow' });
  });

  test('admin level is not found without a session, allowed with one', async () => {
    expect(
      await gateRequest({
        pathname: '/showcase/secret',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'not-found' });
    expect(
      await gateRequest({
        pathname: '/showcase/secret',
        cookies: cookies({ [ADMIN_COOKIE]: 'forged.token' }),
        deps: deps(),
      }),
    ).toEqual({ kind: 'not-found' });
    expect(
      await gateRequest({
        pathname: '/showcase/secret',
        cookies: cookies({ [ADMIN_COOKIE]: await createAdminSession(NOW) }),
        deps: deps(),
      }),
    ).toEqual({ kind: 'allow' });
  });

  test('unknown slugs are treated as admin level', async () => {
    expect(
      await gateRequest({
        pathname: '/showcase/not-in-db',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'not-found' });
  });

  test('repeated slashes cannot skip the gate', async () => {
    expect(
      await gateRequest({
        pathname: '/showcase//secret',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'not-found' });
  });

  test('unlocked without cookies asks for a password', async () => {
    expect(
      await gateRequest({
        pathname: '/showcase/fintech-components',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'unlock', slug: 'fintech-components' });
  });

  test('unlocked with a valid guest token is allowed and records a visit', async () => {
    const token = await signGuestToken(GRANT, 'fintech-components', 'lookup-1');
    const getGrantForToken = vi.fn(async () => ({
      passwordLookup: 'lookup-1',
      active: true,
    }));
    expect(
      await gateRequest({
        pathname: '/showcase/fintech-components/docs',
        cookies: cookies({ [guestCookieName('fintech-components')]: token }),
        deps: deps({ getGrantForToken }),
      }),
    ).toEqual({ kind: 'allow', recordVisit: GRANT });
    expect(getGrantForToken).toHaveBeenCalledWith(
      GRANT,
      'fintech-components',
      NOW,
    );
  });

  test('guest token after a password reset asks for a password', async () => {
    const token = await signGuestToken(GRANT, 'fintech-components', 'lookup-1');
    expect(
      await gateRequest({
        pathname: '/showcase/fintech-components',
        cookies: cookies({ [guestCookieName('fintech-components')]: token }),
        deps: deps({
          getGrantForToken: async () => ({
            passwordLookup: 'lookup-2',
            active: true,
          }),
        }),
      }),
    ).toEqual({ kind: 'unlock', slug: 'fintech-components' });
  });

  test('inactive grant or grant lookup error asks for a password', async () => {
    const token = await signGuestToken(GRANT, 'fintech-components', 'lookup-1');
    const guest = cookies({ [guestCookieName('fintech-components')]: token });
    for (const getGrantForToken of [
      async () => ({ passwordLookup: 'lookup-1', active: false }),
      async () => {
        throw new Error('db down');
      },
    ])
      expect(
        await gateRequest({
          pathname: '/showcase/fintech-components',
          cookies: guest,
          deps: deps({ getGrantForToken }),
        }),
      ).toEqual({ kind: 'unlock', slug: 'fintech-components' });
  });

  test('a guest token for another project is not accepted', async () => {
    const token = await signGuestToken(GRANT, 'other', 'lookup-1');
    expect(
      await gateRequest({
        pathname: '/showcase/fintech-components',
        cookies: cookies({ [guestCookieName('fintech-components')]: token }),
        deps: deps({
          getGrantForToken: async () => ({
            passwordLookup: 'lookup-1',
            active: true,
          }),
        }),
      }),
    ).toEqual({ kind: 'unlock', slug: 'fintech-components' });
  });

  test('database down: fallback cookie allows, nothing else asks for a password', async () => {
    process.env.SHOWCASE_ACCESS = 'kiran:open-sesame:*';
    const failing = deps({
      getLevels: async () => {
        throw new Error('db down');
      },
    });
    const fallback = (await tokenForPassword('secret', 'open-sesame'))!;
    expect(
      await gateRequest({
        pathname: '/showcase/secret',
        cookies: cookies({ [accessCookieName('secret')]: fallback }),
        deps: failing,
      }),
    ).toEqual({ kind: 'allow' });
    expect(
      await gateRequest({
        pathname: '/showcase/bloom',
        cookies: cookies(),
        deps: failing,
      }),
    ).toEqual({ kind: 'unlock', slug: 'bloom' });
  });

  test('fallback cookie opens unlocked but never admin projects', async () => {
    process.env.SHOWCASE_ACCESS = 'kiran:open-sesame:*';
    const unlocked = (await tokenForPassword(
      'fintech-components',
      'open-sesame',
    ))!;
    expect(
      await gateRequest({
        pathname: '/showcase/fintech-components',
        cookies: cookies({
          [accessCookieName('fintech-components')]: unlocked,
        }),
        deps: deps(),
      }),
    ).toEqual({ kind: 'allow' });
    const admin = (await tokenForPassword('secret', 'open-sesame'))!;
    expect(
      await gateRequest({
        pathname: '/showcase/secret',
        cookies: cookies({ [accessCookieName('secret')]: admin }),
        deps: deps(),
      }),
    ).toEqual({ kind: 'not-found' });
  });

  test('/projects/<slug> only gates admin level', async () => {
    const projectLevels = new Map<string, AccessLevel>([['bloom', 'admin']]);
    expect(
      await gateRequest({
        pathname: '/projects/bloom',
        cookies: cookies(),
        deps: deps({ getLevels: async () => projectLevels }),
      }),
    ).toEqual({ kind: 'not-found' });
    expect(
      await gateRequest({
        pathname: '/projects/bloom',
        cookies: cookies({ [ADMIN_COOKIE]: await createAdminSession(NOW) }),
        deps: deps({ getLevels: async () => projectLevels }),
      }),
    ).toEqual({ kind: 'next' });
    expect(
      await gateRequest({
        pathname: '/projects/bloom',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'next' });
    expect(
      await gateRequest({
        pathname: '/projects/fintech-components',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'next' });
  });

  test('/projects/<slug> fails closed when the database is down', async () => {
    expect(
      await gateRequest({
        pathname: '/projects/bloom',
        cookies: cookies(),
        deps: deps({
          getLevels: async () => {
            throw new Error('db down');
          },
        }),
      }),
    ).toEqual({ kind: 'not-found' });
  });
});

describe('getProxyLevels', () => {
  function fakeDb(rows: () => Promise<{ slug: string; level: AccessLevel }[]>) {
    const from = vi.fn(rows);
    return { db: { select: () => ({ from }) } as unknown as Db, from };
  }

  test('caches levels for 10 seconds and never caches a failure', async () => {
    const t0 = 1_000_000;
    const failing = fakeDb(async () => {
      throw new Error('db down');
    });
    await expect(getProxyLevels(failing.db, t0)).rejects.toThrow('db down');

    const ok = fakeDb(async () => [{ slug: 'bloom', level: 'public' }]);
    expect((await getProxyLevels(ok.db, t0)).get('bloom')).toBe('public');
    await getProxyLevels(ok.db, t0 + 9_999);
    expect(ok.from).toHaveBeenCalledTimes(1);
    await getProxyLevels(ok.db, t0 + 10_000);
    expect(ok.from).toHaveBeenCalledTimes(2);
  });
});
