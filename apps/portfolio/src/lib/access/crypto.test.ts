import { describe, expect, test } from 'vitest';

import { hmac, safeEqual } from './crypto';
import { parseGuestToken, signGuestToken } from './passwords';

describe('crypto', () => {
  test('hmac is deterministic hex', async () => {
    const a = await hmac('k', 'm');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hmac('k', 'm')).toBe(a);
    expect(await hmac('k2', 'm')).not.toBe(a);
  });

  test('safeEqual', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'ab')).toBe(false);
  });

  test('guest token verifies only with the same lookup', async () => {
    const token = await signGuestToken('grant-a', 'slug', 'lookup-1');
    const parsed = parseGuestToken(token);
    expect(parsed?.grantId).toBe('grant-a');
    expect(parsed?.signature).toBe(
      await hmac(
        process.env.ADMIN_SESSION_SECRET!,
        'guest:grant-a:slug:lookup-1',
      ),
    );
    const changed = await signGuestToken('grant-a', 'slug', 'lookup-2');
    expect(parseGuestToken(changed)?.signature).not.toBe(parsed?.signature);
  });

  test('tampered or malformed token', async () => {
    const token = await signGuestToken('grant-a', 'slug', 'lookup-1');
    const tampered = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
    expect(parseGuestToken(tampered)?.signature).not.toBe(
      parseGuestToken(token)?.signature,
    );
    expect(parseGuestToken('nodot')).toBeNull();
    expect(parseGuestToken('.sig')).toBeNull();
    expect(parseGuestToken('id.')).toBeNull();
  });
});
