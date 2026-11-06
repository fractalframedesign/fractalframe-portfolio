import { unstable_cache } from 'next/cache';

import { getDb } from '@/lib/db/client';

import { seedLevels } from './gate';
import { getStoredLevels } from './repo/products';

export const LEVELS_TAG = 'product-levels';

const readLevels = unstable_cache(
  async () => {
    const levels = await getStoredLevels(getDb());
    return [...levels.entries()];
  },
  ['product-levels'],
  { tags: [LEVELS_TAG] },
);

/**
 * Project levels for pages and lists. DATABASE_URL unset (dev/CI): the seed
 * levels. Configured but the query fails: throws, so a failed revalidation
 * keeps serving the last good page.
 */
export async function getProductLevels() {
  if (!process.env.DATABASE_URL) return seedLevels();
  return new Map(await readLevels());
}
