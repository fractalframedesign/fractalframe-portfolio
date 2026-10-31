import { describe, expect, test } from 'vitest';

import { accessStatus, checkAccess } from './access-status';
import type { GateDeps } from './gate';

describe('accessStatus', () => {
  test('maps the gate result to what the page watcher needs', () => {
    expect(accessStatus({ kind: 'next' })).toBe('public');
    expect(accessStatus({ kind: 'allow' })).toBe('open');
    expect(accessStatus({ kind: 'allow', recordVisit: 'g' })).toBe('open');
    expect(
      accessStatus({ kind: 'unlock', slug: 's', section: 'projects' }),
    ).toBe('locked');
    expect(accessStatus({ kind: 'not-found' })).toBe('locked');
  });
});

describe('checkAccess', () => {
  const NOW = new Date('2026-11-01T00:00:00Z');
  const base: GateDeps = {
    getLevels: async () => new Map([['cactus-plant', 'unlocked']]),
    getGuestPass: async () => null,
    isAdminSessionCurrent: async () => true,
    now: () => NOW,
  };
  const noCookies = { get: () => undefined };
  const withPass = {
    get: (name: string) =>
      name === 'guest-pass'
        ? `11111111-1111-4111-8111-111111111111.${'a'.repeat(64)}`
        : undefined,
  };

  test('no access is locked', async () => {
    expect(await checkAccess('cactus-plant', noCookies, base)).toBe('locked');
  });

  test('a database error is unknown, never locked', async () => {
    const down = async () => {
      throw new Error('db down');
    };
    expect(
      await checkAccess('cactus-plant', noCookies, {
        ...base,
        getLevels: down,
      }),
    ).toBe('unknown');
    expect(
      await checkAccess('cactus-plant', withPass, {
        ...base,
        getGuestPass: down,
      }),
    ).toBe('unknown');
  });
});
