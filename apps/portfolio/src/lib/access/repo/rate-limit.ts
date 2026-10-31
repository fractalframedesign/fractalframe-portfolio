import { eq } from "drizzle-orm";

import type { Db } from "@/lib/db/client";
import { loginAttempts } from "@/lib/db/schema";

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
  const [row] = await db
    .select()
    .from(loginAttempts)
    .where(eq(loginAttempts.key, key));

  if (row?.lockedUntil && row.lockedUntil.getTime() > now.getTime()) return;

  const windowOpen =
    row && now.getTime() - row.windowStart.getTime() < WINDOW_MS;
  const failures = windowOpen ? row.failures + 1 : 1;
  const windowStart = windowOpen ? row.windowStart : now;
  const lockedUntil =
    failures >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS) : null;

  await db
    .insert(loginAttempts)
    .values({ key, failures, windowStart, lockedUntil })
    .onConflictDoUpdate({
      target: loginAttempts.key,
      set: { failures, windowStart, lockedUntil },
    });
}

export async function clearFailures(db: Db, key: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
}
