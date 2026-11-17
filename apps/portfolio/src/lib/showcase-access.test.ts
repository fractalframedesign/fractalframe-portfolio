import { expect, test } from 'vitest';

import { accessCookieOptions, guestPassCookieOptions } from './showcase-access';

test('the guest pass lives a year; the fallback cookie dies with the browser', () => {
  expect(guestPassCookieOptions()).toMatchObject({
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 31_536_000,
  });
  expect(accessCookieOptions()).not.toHaveProperty('maxAge');
});
