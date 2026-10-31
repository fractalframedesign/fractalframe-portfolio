import { expect, test, vi } from 'vitest';

vi.mock('@/lib/access/cached-levels', () => ({
  getProductLevels: async () =>
    new Map([
      ['bloom', 'public'],
      ['fintech-components', 'unlocked'],
      ['finance-dashboard', 'admin'],
    ]),
}));

import robots from './robots';

test('robots lists only Unlocked slugs, never Admin ones', async () => {
  const { rules } = await robots();
  const disallow = (rules as { disallow: string[] }).disallow;
  expect(disallow).toEqual([
    '/admin',
    '/showcase/unlock',
    '/showcase/fintech-components',
  ]);
  expect(disallow.join()).not.toContain('finance-dashboard');
});
