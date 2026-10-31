import { eq, sql } from 'drizzle-orm';

import type { Db } from '@/lib/db/client';
import { loginAttempts } from '@/lib/db/schema';

const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;

export async function isLocked(db: Db, key: string, now: Date) {
  const [row] = await db
    .select({ lockedUntil: loginAttempts.lockedUntil })
    .from(loginAttempts)
    .where(eq(loginAttempts.key, key));
  return !!row?.lockedUntil && row.lockedUntil.getTime() > now.getTime();
}

export async function recordFailure(db: Db, key: string, now: Date) {
  const at = sql`${now.toISOString()}::timestamptz`;
  const expired = sql`${at} - ${loginAttempts.windowStart} >= interval '15 minutes'`;
  const lockedUntil = new Date(now.getTime() + WINDOW_MS);

  // Single atomic statement so concurrent failures cannot lose increments.
  await db
    .insert(loginAttempts)
    .values({ key, failures: 1, windowStart: now, lockedUntil: null })
    .onConflictDoUpdate({
      target: loginAttempts.key,
      // no-op while a lock is still active
      setWhere: sql`${loginAttempts.lockedUntil} IS NULL OR ${loginAttempts.lockedUntil} <= ${at}`,
      set: {
        failures: sql`CASE WHEN ${expired} THEN 1 ELSE ${loginAttempts.failures} + 1 END`,
        windowStart: sql`CASE WHEN ${expired} THEN ${at} ELSE ${loginAttempts.windowStart} END`,
        lockedUntil: sql`CASE WHEN ${expired} THEN NULL WHEN ${loginAttempts.failures} + 1 >= ${MAX_FAILURES} THEN ${lockedUntil.toISOString()}::timestamptz ELSE NULL END`,
      },
    });
}

export async function clearFailures(db: Db, key: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
}
