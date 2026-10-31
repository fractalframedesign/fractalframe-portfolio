import { sql } from 'drizzle-orm';
import { expect, test } from 'vitest';

import { grants, guests, products } from './schema';
import { createTestDb } from './test-db';

test('migrations create all tables', async () => {
  const db = await createTestDb();
  const rows = (await db.execute(
    sql`select table_name from information_schema.tables where table_schema = 'public'`,
  )) as { rows: { table_name: string }[] };
  expect(rows.rows.map((r) => r.table_name).sort()).toEqual([
    'access_requests',
    'grants',
    'guests',
    'login_attempts',
    'products',
  ]);
});

test('grant is unique per guest and product', async () => {
  const db = await createTestDb();
  await db.insert(products).values({ slug: 'demo', level: 'unlocked' });
  const [guest] = await db
    .insert(guests)
    .values({ name: 'Ada', passwordLookup: 'lookup-1' })
    .returning();
  await db.insert(grants).values({ guestId: guest.id, productSlug: 'demo' });
  await expect(
    db.insert(grants).values({ guestId: guest.id, productSlug: 'demo' }),
  ).rejects.toThrow();
});
