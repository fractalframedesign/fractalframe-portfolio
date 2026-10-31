import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { getDb } from '@/lib/db/client';

import { isSessionCurrent } from './admin-password';
import { ADMIN_COOKIE, readAdminSession } from './admin-session';

// Layout and page both call requireAdmin; read the database once per request
const sessionIsCurrent = cache(async (issuedAtMs: number) => {
  try {
    return await isSessionCurrent(getDb(), new Date(issuedAtMs));
  } catch (error) {
    // Everything behind requireAdmin needs the database, so letting the
    // signed cookie through here exposes nothing; pages show their own error.
    console.error('Admin session check failed', error);
    return true;
  }
});

/** Server only. Call first in every admin page and admin action. */
export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const session = await readAdminSession(token, new Date());
  if (!session || !(await sessionIsCurrent(session.issuedAt.getTime()))) {
    redirect('/admin/login');
  }
  return session;
}
