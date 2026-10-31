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

test('only showcase projects can be unlocked', async () => {
  const db = await createTestDb();
  await expect(setLevel(db, 'bloom', 'unlocked')).rejects.toThrow(
    'Only showcase projects can be Unlocked',
  );
});
