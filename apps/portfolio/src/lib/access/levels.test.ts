import { expect, test } from 'vitest';

import { getProjectSlugs } from '@/lib/projects';

import { resolveLevel, SEED_LEVELS } from './levels';

test('unknown slug resolves to admin', () =>
  expect(resolveLevel('new-thing', new Map())).toBe('admin'));

test('stored level wins', () =>
  expect(resolveLevel('bloom', new Map([['bloom', 'public']]))).toBe('public'));

test('SEED_LEVELS covers every MDX project', async () => {
  expect(Object.keys(SEED_LEVELS).sort()).toEqual(
    (await getProjectSlugs()).sort(),
  );
});
