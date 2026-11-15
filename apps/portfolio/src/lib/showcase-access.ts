import { safeEqual } from '@/lib/access/crypto';

/**
 * One entry per person, read from SHOWCASE_ACCESS:
 *   name:password:project+project, name2:password2:*
 * `*` opens every project. Delete an entry to revoke it. This is the fallback
 * that keeps working when the database is unreachable.
 */
type AccessEntry = {
  name: string;
  password: string;
  projects: string[] | '*';
};

const encoder = new TextEncoder();

/** Cookie set by a SHOWCASE_ACCESS password */
export function accessCookieName(slug: string) {
  return `showcase-access-${slug}`;
}

/** Cookie a guest gets after signing in with an email code: one for every project */
export const GUEST_PASS_COOKIE = 'guest-pass';

/**
 * Session cookie for a SHOWCASE_ACCESS password: no expiry, so the browser
 * drops it when it closes and the password is asked again on the next visit.
 * Path `/` so one unlock covers both /projects/<slug> and /showcase/<slug>.
 */
export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

export const GUEST_PASS_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

/**
 * The guest pass stays for a year, so a guest signs in once per device.
 * Pausing, deleting or expiring them still locks the next page load.
 */
export function guestPassCookieOptions() {
  return { ...accessCookieOptions(), maxAge: GUEST_PASS_MAX_AGE_SECONDS };
}

function getEntries(slug: string) {
  return (process.env.SHOWCASE_ACCESS ?? '')
    .split(',')
    .map((raw): AccessEntry => {
      const [name = '', password = '', projects = ''] = raw.trim().split(':');
      return {
        name,
        password,
        projects: projects === '*' ? '*' : projects.split('+'),
      };
    })
    .filter(
      (entry) =>
        entry.name &&
        entry.password &&
        (entry.projects === '*' || entry.projects.includes(slug)),
    );
}

/** HMAC of the slug keyed by the password, so removing a password signs that person out */
async function sign(password: string, slug: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(slug));

  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

/** Returns the cookie value for a correct password, or undefined */
export async function tokenForPassword(slug: string, password: string) {
  if (!password) return undefined;
  return findToken(slug, await sign(password, slug));
}

export async function hasAccess(slug: string, token: string | undefined) {
  return Boolean(token && (await findToken(slug, token)));
}

async function findToken(slug: string, candidate: string) {
  for (const entry of getEntries(slug)) {
    const token = await sign(entry.password, slug);
    if (safeEqual(candidate, token)) return token;
  }
}
