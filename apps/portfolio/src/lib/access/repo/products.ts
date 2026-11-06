import type { Db } from '@/lib/db/client';
import { products } from '@/lib/db/schema';

import { type AccessLevel, SEED_LEVELS } from '../levels';

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
  await db
    .insert(products)
    .values({ slug, level })
    .onConflictDoUpdate({
      target: products.slug,
      set: { level, updatedAt: new Date() },
    });
}

/**
 * Writes a level for every project that has none yet: the seed level, or
 * Public for projects added after launch. Existing levels are never changed.
 */
export async function seedProducts(
  db: Db,
  projectSlugs: string[] = [],
): Promise<number> {
  const levels: Record<string, AccessLevel> = {
    ...Object.fromEntries(projectSlugs.map((slug) => [slug, 'public'])),
    ...SEED_LEVELS,
  };
  const rows = Object.entries(levels).map(([slug, level]) => ({
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
