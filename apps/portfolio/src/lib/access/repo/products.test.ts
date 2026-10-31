import { expect, test } from 'vitest';

import { createTestDb } from '@/lib/db/test-db';

import { getStoredLevels, seedProducts, setLevel } from './products';

test('seed is idempotent and keeps changed levels', async () => {
  const db = await createTestDb();
  expect(await seedProducts(db)).toBe(17);
  await setLevel(db, 'bloom', 'admin');
  expect(await seedProducts(db)).toBe(0);
  expect((await getStoredLevels(db)).get('bloom')).toBe('admin');
  expect((await getStoredLevels(db)).get('fintech-components')).toBe(
    'unlocked',
  );
});

test('any project can be unlocked, demo or not', async () => {
  const db = await createTestDb();
  await setLevel(db, 'bloom', 'unlocked');
  expect((await getStoredLevels(db)).get('bloom')).toBe('unlocked');
});

test('projects added after launch are seeded as public', async () => {
  const db = await createTestDb();
  await seedProducts(db);
  expect(await seedProducts(db, ['bloom', 'new-project'])).toBe(1);
  const levels = await getStoredLevels(db);
  expect(levels.get('new-project')).toBe('public');
  expect(levels.get('fintech-components')).toBe('unlocked');
});
