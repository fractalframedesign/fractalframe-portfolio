import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_COOKIE, verifyAdminSession } from './admin-session';

/** Server only. Call first in every admin page and admin action. */
export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminSession(token, new Date()))) {
    redirect('/admin/login');
  }
}
