import { afterEach, describe, expect, test, vi } from 'vitest';

import { DatabaseUnavailableError, type Db } from '@/lib/db/client';
import {
  accessCookieName,
  guestCookieName,
  tokenForPassword,
} from '@/lib/showcase-access';

import { ADMIN_COOKIE, createAdminSession } from './admin-session';
import { type GateDeps, gateRequest, offersUnlock } from './gate';
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

  test('public showcase project passes through with no cookie check', async () => {
    expect(
      await gateRequest({
        pathname: '/showcase/bloom/docs',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'next' });
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

  // A fresh module per test so the module-level cache starts cold
  async function freshGate() {
    vi.resetModules();
    return import('./gate');
  }

  const down = () =>
    fakeDb(async () => {
      throw new Error('db down');
    });

  test('caches levels for 10 seconds', async () => {
    const { getProxyLevels } = await freshGate();
    const t0 = 1_000_000;
    const ok = fakeDb(async () => [{ slug: 'bloom', level: 'public' }]);
    expect((await getProxyLevels(() => ok.db, t0)).get('bloom')).toBe('public');
    await getProxyLevels(() => ok.db, t0 + 9_999);
    expect(ok.from).toHaveBeenCalledTimes(1);
    await getProxyLevels(() => ok.db, t0 + 10_000);
    expect(ok.from).toHaveBeenCalledTimes(2);
  });

  test('DATABASE_URL unset: seed levels, so public pages stay open', async () => {
    const gate = await freshGate();
    const unset = () => {
      throw new DatabaseUnavailableError();
    };
    const levels = await gate.getProxyLevels(unset);
    expect(levels.get('bloom')).toBe('public');
    expect(levels.get('fintech-components')).toBe('unlocked');

    const seeded = deps({ getLevels: () => gate.getProxyLevels(unset) });
    expect(
      await gate.gateRequest({
        pathname: '/projects/bloom',
        cookies: cookies(),
        deps: seeded,
      }),
    ).toEqual({ kind: 'next' });
    expect(
      await gate.gateRequest({
        pathname: '/showcase/finance-dashboard',
        cookies: cookies(),
        deps: seeded,
      }),
    ).toEqual({ kind: 'next' });
    expect(
      await gate.gateRequest({
        pathname: '/showcase/fintech-components',
        cookies: cookies(),
        deps: seeded,
      }),
    ).toEqual({ kind: 'unlock', slug: 'fintech-components' });
    expect(
      await gate.gateRequest({
        pathname: '/projects/not-seeded',
        cookies: cookies(),
        deps: seeded,
      }),
    ).toEqual({ kind: 'not-found' });
  });

  test('database down with a warm cache: last read levels are used', async () => {
    const { getProxyLevels } = await freshGate();
    const t0 = 1_000_000;
    const ok = fakeDb(async () => [{ slug: 'secret', level: 'admin' }]);
    await getProxyLevels(() => ok.db, t0);
    const failing = down();
    const stale = await getProxyLevels(() => failing.db, t0 + 60_000);
    expect(stale.get('secret')).toBe('admin');
    expect(failing.from).toHaveBeenCalledOnce();
  });

  test('database down with a cold cache: fails closed', async () => {
    const gate = await freshGate();
    const failing = down();
    await expect(gate.getProxyLevels(() => failing.db)).rejects.toThrow(
      'db down',
    );
    expect(
      await gate.gateRequest({
        pathname: '/projects/bloom',
        cookies: cookies(),
        deps: deps({ getLevels: () => gate.getProxyLevels(() => failing.db) }),
      }),
    ).toEqual({ kind: 'not-found' });
  });
});

describe('offersUnlock', () => {
  test('only Unlocked projects when levels can be read', async () => {
    expect(await offersUnlock('fintech-components', async () => levels)).toBe(
      true,
    );
    expect(await offersUnlock('bloom', async () => levels)).toBe(false);
  });

  test('DATABASE_URL unset: seed levels decide', async () => {
    const unset = () => {
      throw new DatabaseUnavailableError();
    };
    expect(await offersUnlock('fintech-components', unset)).toBe(true);
    expect(await offersUnlock('finance-dashboard', unset)).toBe(false);
  });

  test('database down: any showcase project that could be Unlocked', async () => {
    const failing = async () => {
      throw new Error('db down');
    };
    expect(await offersUnlock('finance-dashboard', failing)).toBe(true);
    expect(await offersUnlock('bloom', failing)).toBe(false);
  });
});
