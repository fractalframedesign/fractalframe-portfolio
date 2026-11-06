'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { clientIp } from '@/lib/access/admin-request';
import { offersUnlock } from '@/lib/access/gate';
import { signGuestPass } from '@/lib/access/passwords';
import {
  findGuestByPassword,
  recordGuestVisit,
} from '@/lib/access/repo/guest-access';
import { getStoredLevels } from '@/lib/access/repo/products';
import { isLocked, recordFailure } from '@/lib/access/repo/rate-limit';
import { getDb } from '@/lib/db/client';
import { getShowcaseProject } from '@/lib/showcase';
import {
  accessCookieName,
  accessCookieOptions,
  GUEST_PASS_COOKIE,
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
  const guest = await tryDb(
    (db) => findGuestByPassword(db, password, now),
    () => (dbDown = true),
  );
  const cookieStore = await cookies();

  if (guest) {
    cookieStore.set(
      GUEST_PASS_COOKIE,
      await signGuestPass(guest.guestId, guest.passwordLookup),
      accessCookieOptions(),
    );
    await tryDb((db) => recordGuestVisit(db, guest.guestId, now));
    redirect(safeNext(slug, next));
  }

  const fallback = await tokenForPassword(slug, password);
  if (fallback) {
    cookieStore.set(accessCookieName(slug), fallback, accessCookieOptions());
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

/**
 * Only follow `next` back into the same project (its showcase or its case
 * study), never anywhere else. Default: the demo if it has one.
 */
function safeNext(slug: string, next: string) {
  const showcase = `/showcase/${slug}`;
  const caseStudy = `/projects/${slug}`;
  const fallback = getShowcaseProject(slug) ? showcase : caseStudy;

  // Resolve it the way the browser will (dot segments, %2e%2e, //host),
  // then accept only the same site and the same project
  let url: URL;
  try {
    url = new URL(next, 'https://same.site');
  } catch {
    return fallback;
  }
  if (url.origin !== 'https://same.site' || next.includes('\\')) {
    return fallback;
  }
  const path = url.pathname;
  const within = (base: string) => path === base || path.startsWith(`${base}/`);
  return within(showcase) || within(caseStudy)
    ? `${path}${url.search}${url.hash}`
    : fallback;
}
