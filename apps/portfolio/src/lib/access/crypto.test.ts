import { describe, expect, test } from 'vitest';

import { hmac, safeEqual } from './crypto';

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
});
