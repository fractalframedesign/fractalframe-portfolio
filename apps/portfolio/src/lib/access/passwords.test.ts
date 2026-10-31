import { describe, expect, test } from 'vitest';

import {
  generatePassword,
  normalizePassword,
  parseGuestPass,
  passwordLookup,
  signGuestPass,
  verifyGuestPass,
} from './passwords';
import { WORDS } from './words';

describe('passwords', () => {
  test('normalizes password before lookup', async () => {
    expect(await passwordLookup('  Amber-River-42 ')).toBe(
      await passwordLookup('amber-river-42'),
    );
  });

  test('normalizePassword trims and lowercases', () => {
    expect(normalizePassword('  AbC ')).toBe('abc');
  });

  test('lookup throws without secret', async () => {
    const secret = process.env.ADMIN_SESSION_SECRET;
    delete process.env.ADMIN_SESSION_SECRET;
    await expect(passwordLookup('x')).rejects.toThrow();
    process.env.ADMIN_SESSION_SECRET = secret;
  });

  test('generated password format', () => {
    for (let i = 0; i < 50; i++)
      expect(generatePassword()).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[1-9]\d$/);
  });

  test('generated words are distinct', () => {
    for (let i = 0; i < 50; i++) {
      const [a, b, c] = generatePassword().split('-');
      expect(new Set([a, b, c]).size).toBe(3);
    }
  });

  test('accepts a deterministic random', () => {
    expect(generatePassword(() => 0)).toBe(
      `${WORDS[0]}-${WORDS[1]}-${WORDS[2]}-10`,
    );
  });
});

describe('WORDS', () => {
  test('has enough distinct, well-shaped words', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(512);
    expect(new Set(WORDS).size).toBe(WORDS.length);
    for (const w of WORDS) expect(w).toMatch(/^[a-z]{3,8}$/);
  });
});

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
