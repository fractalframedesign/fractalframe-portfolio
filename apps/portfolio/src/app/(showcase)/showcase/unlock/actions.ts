'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { offersUnlock } from '@/lib/access/gate';
import { signGuestToken } from '@/lib/access/passwords';
import { findGrantByPassword, recordVisit } from '@/lib/access/repo/guests';
import { getStoredLevels } from '@/lib/access/repo/products';
import { isLocked, recordFailure } from '@/lib/access/repo/rate-limit';
import { getDb } from '@/lib/db/client';
import {
  accessCookieName,
  accessCookieOptions,
  guestCookieName,
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
  outage:
    'We can’t check passwords right now. Please try again in a few minutes.',
  wrong: 'That password isn’t right. Try again.',
};

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

  let dbDown = false;
  const grant = await tryDb(
    (db) => findGrantByPassword(db, slug, password, now),
    () => (dbDown = true),
  );
  const cookieStore = await cookies();

  if (grant) {
    cookieStore.set(
      guestCookieName(slug),
      await signGuestToken(grant.grantId, slug, grant.passwordLookup),
      accessCookieOptions(slug),
    );
    await tryDb((db) => recordVisit(db, grant.grantId, now));
    redirect(safeNext(slug, next));
  }

  const fallback = await tokenForPassword(slug, password);
  if (fallback) {
    cookieStore.set(
      accessCookieName(slug),
      fallback,
      accessCookieOptions(slug),
    );
    redirect(safeNext(slug, next));
  }

  if (dbDown) return { error: ERRORS.outage };

  await tryDb((db) => recordFailure(db, limitKey, now));
  return { error: ERRORS.wrong };
}

/** Runs a database call; on any error logs it, calls onError and returns undefined */
async function tryDb<T>(
  run: (db: ReturnType<typeof getDb>) => Promise<T>,
  onError?: () => void,
): Promise<T | undefined> {
  try {
    return await run(getDb());
  } catch (error) {
    console.error('Unlock database call failed', error);
    onError?.();
    return undefined;
  }
}

async function clientIp() {
  const forwarded = (await headers()).get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

/** Only follow `next` back into the same project, never to another site */
function safeNext(slug: string, next: string) {
  const base = `/showcase/${slug}`;
  return next === base ||
    next.startsWith(`${base}/`) ||
    next.startsWith(`${base}?`)
    ? next
    : base;
}
