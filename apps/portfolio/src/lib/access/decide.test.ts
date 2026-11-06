import { describe, expect, test } from 'vitest';

import { decideAccess } from './decide';

const flags = [true, false];

describe('decideAccess', () => {
  test('public is always allowed', () => {
    for (const isAdmin of flags)
      for (const hasGuestAccess of flags)
        for (const hasFallbackAccess of flags)
          expect(
            decideAccess({
              level: 'public',
              isAdmin,
              hasGuestAccess,
              hasFallbackAccess,
            }),
          ).toBe('allow');
  });

  test('admin level only allows the admin', () => {
    for (const hasGuestAccess of flags)
      for (const hasFallbackAccess of flags) {
        expect(
          decideAccess({
            level: 'admin',
            isAdmin: true,
            hasGuestAccess,
            hasFallbackAccess,
          }),
        ).toBe('allow');
        expect(
          decideAccess({
            level: 'admin',
            isAdmin: false,
            hasGuestAccess,
            hasFallbackAccess,
          }),
        ).toBe('not-found');
      }
  });

  test('unlocked allows admin, guest or fallback', () => {
    for (const isAdmin of flags)
      for (const hasGuestAccess of flags)
        for (const hasFallbackAccess of flags)
          expect(
            decideAccess({
              level: 'unlocked',
              isAdmin,
              hasGuestAccess,
              hasFallbackAccess,
            }),
          ).toBe(
            isAdmin || hasGuestAccess || hasFallbackAccess ? 'allow' : 'unlock',
          );
  });

  test('unknown-db-down ignores guest access', () => {
    for (const isAdmin of flags)
      for (const hasGuestAccess of flags)
        for (const hasFallbackAccess of flags)
          expect(
            decideAccess({
              level: 'unknown-db-down',
              isAdmin,
              hasGuestAccess,
              hasFallbackAccess,
            }),
          ).toBe(isAdmin || hasFallbackAccess ? 'allow' : 'unlock');
  });

  test('examples', () => {
    expect(
      decideAccess({
        level: 'admin',
        isAdmin: false,
        hasGuestAccess: true,
        hasFallbackAccess: true,
      }),
    ).toBe('not-found');
    expect(
      decideAccess({
        level: 'unknown-db-down',
        isAdmin: false,
        hasGuestAccess: false,
        hasFallbackAccess: false,
      }),
    ).toBe('unlock');
  });
});
