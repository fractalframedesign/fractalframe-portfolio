'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  ADMIN_COOKIE,
  adminCookieOptions,
  checkAdminPassword,
  createAdminSession,
} from '@/lib/access/admin-session';
import { loginDelay } from '@/lib/access/login-delay';
import {
  clearFailures,
  isLocked,
  recordFailure,
} from '@/lib/access/repo/rate-limit';
import { getDb } from '@/lib/db/client';

export type LoginState = { error?: string };

const loginSchema = z.object({ password: z.string().max(200) });

const ERRORS = {
  locked: 'Too many tries. Try again in 15 minutes.',
  wrong: 'That password isn’t right.',
};

const WRONG_PASSWORD_DELAY_MS = 1000;

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) return { error: ERRORS.wrong };

  const now = new Date();
  const limitKey = `admin:${await clientIp()}`;
  if (await tryDb((db) => isLocked(db, limitKey, now))) {
    return { error: ERRORS.locked };
  }

  if (await checkAdminPassword(parsed.data.password)) {
    await tryDb((db) => clearFailures(db, limitKey));
    (await cookies()).set(
      ADMIN_COOKIE,
      await createAdminSession(now),
      adminCookieOptions(),
    );
    redirect('/admin');
  }

  await tryDb((db) => recordFailure(db, limitKey, now));
  await loginDelay(WRONG_PASSWORD_DELAY_MS);
  return { error: ERRORS.wrong };
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

/** Runs a database call; on any error logs it and returns undefined */
async function tryDb<T>(
  run: (db: ReturnType<typeof getDb>) => Promise<T>,
): Promise<T | undefined> {
  try {
    return await run(getDb());
  } catch (error) {
    console.error('Admin login database call failed', error);
    return undefined;
  }
}

async function clientIp() {
  const forwarded = (await headers()).get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
