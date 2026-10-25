'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  accessCookieName,
  accessCookieOptions,
  getProtectedSlug,
  tokenForPassword,
} from '@/lib/showcase-access';

export type UnlockState = { error?: string };

export async function unlock(
  _state: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const slug = getProtectedSlug(`/showcase/${formData.get('project')}`);
  const password = String(formData.get('password') ?? '').trim();

  if (!slug) return { error: 'This project doesn’t need a password.' };

  const token = await tokenForPassword(slug, password);
  if (!token) return { error: 'That password isn’t right. Try again.' };

  (await cookies()).set(
    accessCookieName(slug),
    token,
    accessCookieOptions(slug),
  );

  // Only follow `next` back into the same project, never to another site
  const next = String(formData.get('next') ?? '');
  const base = `/showcase/${slug}`;
  redirect(
    next === base || next.startsWith(`${base}/`) || next.startsWith(`${base}?`)
      ? next
      : base,
  );
}
