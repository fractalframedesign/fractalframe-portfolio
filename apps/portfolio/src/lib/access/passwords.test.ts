import { describe, expect, test } from 'vitest';

import {
  generatePassword,
  normalizePassword,
  parseGuestToken,
  passwordLookup,
  signGuestToken,
  verifyGuestToken,
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

describe('guest tokens', () => {
  const grantId = '11111111-1111-4111-8111-111111111111';

  test('verifyGuestToken accepts a token signed with the same lookup', async () => {
    const token = await signGuestToken(grantId, 'slug', 'lookup-1');
    expect(await verifyGuestToken(token, 'slug', 'lookup-1')).toBe(true);
    expect(await verifyGuestToken(token, 'other', 'lookup-1')).toBe(false);
  });

  test('a token stops verifying after the password changes', async () => {
    const token = await signGuestToken(grantId, 'slug', 'lookup-1');
    expect(await verifyGuestToken(token, 'slug', 'lookup-2')).toBe(false);
  });

  test('parseGuestToken is strict', async () => {
    const token = await signGuestToken(grantId, 'slug', 'lookup-1');
    const signature = token.split('.')[1]!;
    expect(parseGuestToken(token)).toEqual({ grantId, signature });
    expect(parseGuestToken(`a.${grantId}.${signature}`)).toBeNull();
    expect(parseGuestToken(`${grantId}.${signature.toUpperCase()}`)).toBeNull();
    expect(parseGuestToken(`${grantId}.${signature}0`)).toBeNull();
    expect(parseGuestToken(`${grantId}.xyz`)).toBeNull();
    expect(await verifyGuestToken('garbage', 'slug', 'lookup-1')).toBe(false);
  });
});
