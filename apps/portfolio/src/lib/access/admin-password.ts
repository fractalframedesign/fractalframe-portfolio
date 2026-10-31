import type { Db } from '@/lib/db/client';

import { checkAdminPassword } from './admin-session';
import { hashPassword, verifyPasswordHash } from './password-hash';
import { getAdminAccount, setAdminPassword } from './repo/admin-account';

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 200;

/**
 * The password set in the console wins. ADMIN_PASSWORD (Vercel) only works
 * until one has been set. Throws when the database can't be read, so callers
 * fail closed instead of falling back to the env password.
 */
export async function checkAdminLogin(db: Db, input: string) {
  const account = await getAdminAccount(db);
  return account
    ? verifyPasswordHash(input, account.passwordHash)
    : checkAdminPassword(input);
}

export async function changeAdminPassword(db: Db, next: string, now: Date) {
  await setAdminPassword(db, await hashPassword(next), now);
}

/** Sessions started before the last password change are signed out */
export async function isSessionCurrent(db: Db, issuedAt: Date) {
  const account = await getAdminAccount(db);
  return !account || issuedAt.getTime() >= account.passwordChangedAt.getTime();
}
