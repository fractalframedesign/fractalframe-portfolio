'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { clientIp, tryDb } from '@/lib/access/admin-request';
import { offersUnlock } from '@/lib/access/gate';
import { getStoredLevels } from '@/lib/access/repo/products';
import { isLocked, recordFailure } from '@/lib/access/repo/rate-limit';
import { safeNext } from '@/lib/access/safe-next';
import { getDb } from '@/lib/db/client';
import {
  accessCookieName,
  accessCookieOptions,
  tokenForPassword,
} from '@/lib/showcase-access';

export type UnlockState = { error?: string };

const unlockSchema = z.object({
  project: z.string().max(100),
  password: z.string().trim().max(200),
  next: z.string().max(2000),
});

const ERRORS = {
  notNeeded: 'This project doesn’t need a password.',
  locked: 'Too many tries. Try again in 15 minutes.',
  wrong: 'That password isn’t right. Try again.',
};

/**
 * The emergency passwords from SHOWCASE_ACCESS, for when the database is down.
 * Guests sign in with an email code instead (see sign-in.ts).
 */
export async function unlock(
  _state: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const parsed = unlockSchema.safeParse({
    project: String(formData.get('project') ?? ''),
    password: String(formData.get('password') ?? ''),
    next: String(formData.get('next') ?? ''),
  });
  if (!parsed.success) return { error: ERRORS.wrong };
  const { project: slug, password, next } = parsed.data;

  if (!(await offersUnlock(slug, () => getStoredLevels(getDb())))) {
    return { error: ERRORS.notNeeded };
  }

  const now = new Date();
  const limitKey = `unlock:${await clientIp()}`;
  if (await tryDb((db) => isLocked(db, limitKey, now))) {
    return { error: ERRORS.locked };
  }

  const fallback = await tokenForPassword(slug, password);
  if (fallback) {
    (await cookies()).set(
      accessCookieName(slug),
      fallback,
      accessCookieOptions(),
    );
    redirect(safeNext(slug, next));
  }

  await tryDb((db) => recordFailure(db, limitKey, now));
  return { error: ERRORS.wrong };
}
