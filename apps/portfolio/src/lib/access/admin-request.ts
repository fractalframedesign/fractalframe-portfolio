import { headers } from 'next/headers';

import { getDb } from '@/lib/db/client';

/** Runs a database call; on any error logs it and returns undefined */
export async function tryDb<T>(
  run: (db: ReturnType<typeof getDb>) => Promise<T>,
): Promise<T | undefined> {
  try {
    return await run(getDb());
  } catch (error) {
    console.error('Admin database call failed', error);
    return undefined;
  }
}

export async function clientIp() {
  const forwarded = (await headers()).get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
