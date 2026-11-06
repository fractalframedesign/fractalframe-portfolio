'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { checkAdminLogin } from '@/lib/access/admin-password';
import { clientIp, tryDb } from '@/lib/access/admin-request';
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSession,
} from '@/lib/access/admin-session';
import { loginDelay } from '@/lib/access/login-delay';
import {
  clearFailures,
  isLocked,
  recordFailure,
} from '@/lib/access/repo/rate-limit';

export type LoginState = { error?: string };

const loginSchema = z.object({
  password: z.string().max(200),
  rememberMe: z.boolean(),
});

const ERRORS = {
  locked: 'Too many tries. Try again in 15 minutes.',
  wrong: 'That password isn’t right.',
  unavailable: 'Can’t check your password right now. Try again in a minute.',
};

const WRONG_PASSWORD_DELAY_MS = 1000;

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    password: String(formData.get('password') ?? ''),
    rememberMe: formData.get('rememberMe') === 'on',
  });
  if (!parsed.success) return { error: ERRORS.wrong };

  const now = new Date();
  const limitKey = `admin:${await clientIp()}`;
  if (await tryDb((db) => isLocked(db, limitKey, now))) {
    return { error: ERRORS.locked };
  }

  const correct = await tryDb((db) =>
    checkAdminLogin(db, parsed.data.password),
  );
  // Fail closed: without the database we can't tell which password is current
  if (correct === undefined) return { error: ERRORS.unavailable };

  if (correct) {
    await tryDb((db) => clearFailures(db, limitKey));
    (await cookies()).set(
      ADMIN_COOKIE,
      await createAdminSession(now, parsed.data.rememberMe),
      adminCookieOptions(parsed.data.rememberMe),
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
