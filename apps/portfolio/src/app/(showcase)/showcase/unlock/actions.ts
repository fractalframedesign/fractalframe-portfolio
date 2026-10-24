'use server';

import { redirect } from 'next/navigation';

import {
  ACCESS_PARAM,
  createAccessPass,
  getProtectedSlug,
} from '@/lib/showcase-access';

export type UnlockState = { error?: string };

export async function unlock(
  _state: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const slug = getProtectedSlug(`/showcase/${formData.get('project')}`);
  const password = String(formData.get('password') ?? '').trim();

  if (!slug) return { error: 'This project doesn’t need a password.' };

  const pass = await createAccessPass(slug, password);
  if (!pass) return { error: 'That password isn’t right. Try again.' };

  // Only follow `next` back into the same project, never to another site
  const next = String(formData.get('next') ?? '');
  const base = `/showcase/${slug}`;
  const target = new URL(
    next === base || next.startsWith(`${base}/`) || next.startsWith(`${base}?`)
      ? next
      : base,
    'http://localhost',
  );
  target.searchParams.set(ACCESS_PARAM, pass);

  redirect(target.pathname + target.search);
}
