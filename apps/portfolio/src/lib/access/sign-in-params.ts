import { z } from 'zod';

const emailSchema = z.email().max(320);

/** An `?email=` value from the address bar, only if it really is one email */
export function emailParam(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const parsed = emailSchema.safeParse(value.trim());
  return parsed.success ? parsed.data : undefined;
}

/**
 * The sign-in email links back to the page with `?email=` added. On the
 * showcase that page arrives inside `next`, so the email is lifted out of it
 * and the visitor returns to a clean address once signed in.
 */
export function takeEmail(next: string): { next: string; email?: string } {
  let url: URL;
  try {
    url = new URL(next, 'https://same.site');
  } catch {
    return { next };
  }
  if (url.origin !== 'https://same.site' || !url.searchParams.has('email')) {
    return { next };
  }
  const email = emailParam(url.searchParams.get('email'));
  url.searchParams.delete('email');
  const cleaned = `${url.pathname}${url.search}${url.hash}`;
  return email ? { next: cleaned, email } : { next: cleaned };
}
