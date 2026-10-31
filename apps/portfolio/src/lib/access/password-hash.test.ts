import { describe, expect, test } from 'vitest';

import { hashPassword, verifyPasswordHash } from './password-hash';

describe('password hash', () => {
  test('verifies the right password and rejects others', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(stored).toMatch(/^scrypt\$/);
    expect(stored).not.toContain('correct horse battery');
    expect(await verifyPasswordHash('correct horse battery', stored)).toBe(true);
    expect(await verifyPasswordHash('correct horse batter', stored)).toBe(false);
  });

  test('salts each hash', async () => {
    expect(await hashPassword('same password')).not.toBe(
      await hashPassword('same password'),
    );
  });

  test('a malformed stored value never verifies', async () => {
    expect(await verifyPasswordHash('x', 'garbage')).toBe(false);
    expect(await verifyPasswordHash('x', 'scrypt$1$2$3$$')).toBe(false);
  });
});
