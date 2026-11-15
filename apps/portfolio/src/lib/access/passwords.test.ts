import { describe, expect, test } from 'vitest';

import {
  generatePassKey,
  generateSignInCode,
  hashSignInCode,
  parseGuestPass,
  signGuestPass,
  verifyGuestPass,
} from './passwords';

describe('guest pass', () => {
  const GUEST = '11111111-1111-4111-8111-111111111111';

  test('round-trips for the same guest and password lookup', async () => {
    const pass = await signGuestPass(GUEST, 'lookup-1');
    expect(await verifyGuestPass(pass, 'lookup-1')).toBe(true);
    expect(parseGuestPass(pass)?.guestId).toBe(GUEST);
  });

  test('a new password, another guest or a tampered signature fails', async () => {
    const pass = await signGuestPass(GUEST, 'lookup-1');
    expect(await verifyGuestPass(pass, 'lookup-2')).toBe(false);
    const other = pass.replace(GUEST, GUEST.replace('1', '2'));
    expect(await verifyGuestPass(other, 'lookup-1')).toBe(false);
    const flipped = pass.slice(0, -1) + (pass.endsWith('0') ? '1' : '0');
    expect(await verifyGuestPass(flipped, 'lookup-1')).toBe(false);
  });

  test('parse is strict', () => {
    expect(parseGuestPass('a.b.c')).toBeNull();
    expect(parseGuestPass(`${'x'}.${'a'.repeat(64)}`)).toBeNull();
    expect(parseGuestPass(`${GUEST}.short`)).toBeNull();
  });
});

test('generatePassKey is 64 hex chars and never repeats', () => {
  const a = generatePassKey();
  expect(a).toMatch(/^[0-9a-f]{64}$/);
  expect(generatePassKey()).not.toBe(a);
});

test('generateSignInCode is six digits, zero-padded', () => {
  expect(generateSignInCode(() => 0)).toBe('000000');
  expect(generateSignInCode(() => 0.999999)).toBe('999999');
  expect(generateSignInCode()).toMatch(/^\d{6}$/);
});

test('hashSignInCode binds the code to the guest', async () => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret';
  const a = await hashSignInCode('guest-a', '123456');
  expect(a).toMatch(/^[0-9a-f]{64}$/);
  expect(await hashSignInCode('guest-b', '123456')).not.toBe(a);
  expect(await hashSignInCode('guest-a', '123457')).not.toBe(a);
});

test('hashSignInCode throws without the secret', async () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_SESSION_SECRET;
  await expect(hashSignInCode('guest-a', '123456')).rejects.toThrow();
  process.env.ADMIN_SESSION_SECRET = secret;
});
