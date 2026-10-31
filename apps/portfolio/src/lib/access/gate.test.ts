import { afterEach, describe, expect, test, vi } from 'vitest';

import { DatabaseUnavailableError, type Db } from '@/lib/db/client';
import {
  accessCookieName,
  GUEST_PASS_COOKIE,
  tokenForPassword,
} from '@/lib/showcase-access';

import { ADMIN_COOKIE, createAdminSession } from './admin-session';
import { type GateDeps, gateRequest, offersUnlock } from './gate';
import type { AccessLevel } from './levels';
import { signGuestPass } from './passwords';

const NOW = new Date('2026-01-01T12:00:00Z');
const GUEST = '11111111-1111-4111-8111-111111111111';

const levels = new Map<string, AccessLevel>([
  ['bloom', 'public'],
  ['fintech-components', 'unlocked'],
  ['cactus-plant', 'unlocked'],
  ['secret', 'admin'],
]);

function deps(overrides: Partial<GateDeps> = {}): GateDeps {
  return {
    getLevels: async () => levels,
    getGuestPass: async () => null,
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
    ).toEqual({
      kind: 'unlock',
      slug: 'fintech-components',
      section: 'showcase',
    });
  });

  test('a locked case study asks for a password on /projects', async () => {
    expect(
      await gateRequest({
        pathname: '/projects/cactus-plant',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'unlock', slug: 'cactus-plant', section: 'projects' });
  });

  test('one guest pass opens every locked project and records a visit', async () => {
    const pass = await signGuestPass(GUEST, 'lookup-1');
    const getGuestPass = vi.fn(async () => ({
      passwordLookup: 'lookup-1',
      active: true,
    }));
    for (const pathname of [
      '/showcase/fintech-components/docs',
      '/projects/fintech-components',
      '/projects/cactus-plant',
    ])
      expect(
        await gateRequest({
          pathname,
          cookies: cookies({ [GUEST_PASS_COOKIE]: pass }),
          deps: deps({ getGuestPass }),
        }),
      ).toEqual({ kind: 'allow', recordVisit: GUEST });
    expect(getGuestPass).toHaveBeenCalledWith(GUEST, NOW);
  });

  test('a pass from before a new password, or for a paused, expired or deleted guest, asks again', async () => {
    const pass = cookies({
      [GUEST_PASS_COOKIE]: await signGuestPass(GUEST, 'lookup-1'),
    });
    for (const getGuestPass of [
      async () => ({ passwordLookup: 'lookup-2', active: true }),
      async () => ({ passwordLookup: 'lookup-1', active: false }),
      async () => null,
      async () => {
        throw new Error('db down');
      },
    ])
      expect(
        await gateRequest({
          pathname: '/projects/cactus-plant',
          cookies: pass,
          deps: deps({ getGuestPass }),
        }),
      ).toEqual({ kind: 'unlock', slug: 'cactus-plant', section: 'projects' });
  });

  test('old per-project guest cookies no longer open anything', async () => {
    expect(
      await gateRequest({
        pathname: '/showcase/fintech-components',
        cookies: cookies({
          'showcase-guest-fintech-components': `${GUEST}.${'a'.repeat(64)}`,
        }),
        deps: deps({
          getGuestPass: async () => ({ passwordLookup: 'x', active: true }),
        }),
      }),
    ).toEqual({
      kind: 'unlock',
      slug: 'fintech-components',
      section: 'showcase',
    });
  });

  test('a pass never opens hidden projects', async () => {
    expect(
      await gateRequest({
        pathname: '/projects/secret',
        cookies: cookies({
          [GUEST_PASS_COOKIE]: await signGuestPass(GUEST, 'lookup-1'),
        }),
        deps: deps({
          getGuestPass: async () => ({
            passwordLookup: 'lookup-1',
            active: true,
          }),
        }),
      }),
    ).toEqual({ kind: 'not-found' });
  });

  test('database down: fallback cookie allows, nothing else asks for a password', async () => {
    process.env.SHOWCASE_ACCESS = 'kiran:open-sesame:*';
    const failing = deps({
      getLevels: async () => {
        throw new Error('db down');
      },
      getGuestPass: async () => ({ passwordLookup: 'lookup-1', active: true }),
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
        pathname: '/projects/bloom',
        cookies: cookies({
          [GUEST_PASS_COOKIE]: await signGuestPass(GUEST, 'lookup-1'),
        }),
        deps: failing,
      }),
    ).toEqual({ kind: 'unlock', slug: 'bloom', section: 'projects' });
  });

  test('fallback cookie opens unlocked but never admin projects', async () => {
    process.env.SHOWCASE_ACCESS = 'kiran:open-sesame:*';
    const unlocked = (await tokenForPassword('cactus-plant', 'open-sesame'))!;
    expect(
      await gateRequest({
        pathname: '/projects/cactus-plant',
        cookies: cookies({ [accessCookieName('cactus-plant')]: unlocked }),
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

  test('/projects/<slug>: public passes, hidden is admin-only', async () => {
    expect(
      await gateRequest({
        pathname: '/projects/bloom',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'next' });
    expect(
      await gateRequest({
        pathname: '/projects/secret',
        cookies: cookies(),
        deps: deps(),
      }),
    ).toEqual({ kind: 'not-found' });
    expect(
      await gateRequest({
        pathname: '/projects/secret',
        cookies: cookies({ [ADMIN_COOKIE]: await createAdminSession(NOW) }),
        deps: deps(),
      }),
    ).toEqual({ kind: 'allow' });
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
    ).toEqual({
      kind: 'unlock',
      slug: 'fintech-components',
      section: 'showcase',
    });
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

  test('database down with a cold cache: fails closed (the lock, never the page)', async () => {
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
    ).toEqual({ kind: 'unlock', slug: 'bloom', section: 'projects' });
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

  test('database down: only projects whose seed level is Unlocked', async () => {
    const failing = async () => {
      throw new Error('db down');
    };
    expect(await offersUnlock('fintech-components', failing)).toBe(true);
    expect(await offersUnlock('finance-dashboard', failing)).toBe(false);
    expect(await offersUnlock('bloom', failing)).toBe(false);
  });
});
