'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

import {
  changeAdminPassword,
  checkAdminLogin,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@/lib/access/admin-password';
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
import { requireAdmin } from '@/lib/access/require-admin';

export type PasswordState = {
  error?: string;
  field?: 'currentPassword' | 'newPassword' | 'confirmPassword';
  saved?: boolean;
};

const WRONG_PASSWORD_DELAY_MS = 1000;

const ERRORS = {
  short: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  long: `Use ${MAX_PASSWORD_LENGTH} characters or fewer.`,
  mismatch: 'The new passwords don’t match.',
  same: 'Choose a password different from your current one.',
  wrong: 'Your current password isn’t right.',
  locked: 'Too many tries. Try again in 15 minutes.',
  unavailable: 'Couldn’t save. Nothing changed. Try again in a minute.',
};

const schema = z.object({
  currentPassword: z.string().max(MAX_PASSWORD_LENGTH),
  newPassword: z.string(),
  confirmPassword: z.string(),
});

export async function changePassword(
  _state: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await requireAdmin();

  const parsed = schema.safeParse({
    currentPassword: String(formData.get('currentPassword') ?? ''),
    newPassword: String(formData.get('newPassword') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  });
  if (!parsed.success) return { error: ERRORS.wrong, field: 'currentPassword' };
  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (newPassword.length < MIN_PASSWORD_LENGTH)
    return { error: ERRORS.short, field: 'newPassword' };
  if (newPassword.length > MAX_PASSWORD_LENGTH)
    return { error: ERRORS.long, field: 'newPassword' };
  if (newPassword !== confirmPassword)
    return { error: ERRORS.mismatch, field: 'confirmPassword' };
  if (newPassword === currentPassword)
    return { error: ERRORS.same, field: 'newPassword' };

  // Shares the login's limit so a stolen session can't guess the password here
  const now = new Date();
  const limitKey = `admin:${await clientIp()}`;
  if (await tryDb((db) => isLocked(db, limitKey, now))) {
    return { error: ERRORS.locked, field: 'currentPassword' };
  }

  const correct = await tryDb((db) => checkAdminLogin(db, currentPassword));
  if (correct === undefined) return { error: ERRORS.unavailable };
  if (!correct) {
    await tryDb((db) => recordFailure(db, limitKey, now));
    await loginDelay(WRONG_PASSWORD_DELAY_MS);
    return { error: ERRORS.wrong, field: 'currentPassword' };
  }

  const saved = await tryDb(async (db) => {
    await changeAdminPassword(db, newPassword, now);
    return true;
  });
  if (!saved) return { error: ERRORS.unavailable };
  await tryDb((db) => clearFailures(db, limitKey));

  // Older sessions (other devices) are now signed out; keep this one
  (await cookies()).set(
    ADMIN_COOKIE,
    await createAdminSession(now, session.rememberMe),
    adminCookieOptions(session.rememberMe),
  );
  return { saved: true };
}
