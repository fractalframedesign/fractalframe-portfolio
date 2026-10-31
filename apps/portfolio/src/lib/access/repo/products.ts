import type { Db } from '@/lib/db/client';
import { products } from '@/lib/db/schema';

import { type AccessLevel, canBeUnlocked, SEED_LEVELS } from '../levels';

export async function getStoredLevels(
  db: Db,
): Promise<Map<string, AccessLevel>> {
  const rows = await db
    .select({ slug: products.slug, level: products.level })
    .from(products);
  return new Map(rows.map((row) => [row.slug, row.level]));
}

export async function setLevel(
  db: Db,
  slug: string,
  level: AccessLevel,
): Promise<void> {
  if (level === 'unlocked' && !canBeUnlocked(slug)) {
    throw new Error('Only showcase projects can be Unlocked');
  }
  await db
    .insert(products)
    .values({ slug, level })
    .onConflictDoUpdate({
      target: products.slug,
      set: { level, updatedAt: new Date() },
    });
}

export async function seedProducts(db: Db): Promise<number> {
  const rows = Object.entries(SEED_LEVELS).map(([slug, level]) => ({
    slug,
    level,
  }));
  const inserted = await db
    .insert(products)
    .values(rows)
    .onConflictDoNothing()
    .returning({ slug: products.slug });
  return inserted.length;
}
