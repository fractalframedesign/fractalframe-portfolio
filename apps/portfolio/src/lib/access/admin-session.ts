import { hmac, safeEqual } from './crypto';

export const ADMIN_COOKIE = 'admin-session';
const SESSION_SECONDS = 12 * 60 * 60;
const REMEMBERED_SESSION_SECONDS = 30 * 24 * 60 * 60;

export function adminCookieOptions(rememberMe = false) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: rememberMe ? REMEMBERED_SESSION_SECONDS : SESSION_SECONDS,
  };
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return secret;
}

/** Token: `issuedAt.expiresAt.signature` (ms since epoch, HMAC over both) */
export async function createAdminSession(now: Date, rememberMe = false) {
  const duration = rememberMe ? REMEMBERED_SESSION_SECONDS : SESSION_SECONDS;
  const issuedAtMs = now.getTime();
  const expiresAtMs = issuedAtMs + duration * 1000;
  return `${issuedAtMs}.${expiresAtMs}.${await sign(issuedAtMs, expiresAtMs)}`;
}

function sign(issuedAt: number | string, expiresAt: number | string) {
  return hmac(sessionSecret(), `admin:${issuedAt}:${expiresAt}`);
}

/**
 * Checks the signature and expiry only (no database, so the proxy can use it).
 * Returns the session's times, or null when it isn't valid.
 */
export async function readAdminSession(token: string | undefined, now: Date) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return null;
  const [issuedAt, expiresAt, signature, ...rest] = token.split('.');
  if (!issuedAt || !expiresAt || !signature || rest.length) return null;
  if (!/^\d+$/.test(issuedAt) || !/^\d+$/.test(expiresAt)) return null;
  if (Number(expiresAt) <= now.getTime()) return null;
  if (!safeEqual(signature, await sign(issuedAt, expiresAt))) return null;

  const issued = Number(issuedAt);
  const expires = Number(expiresAt);
  return {
    issuedAt: new Date(issued),
    rememberMe: expires - issued > SESSION_SECONDS * 1000,
  };
}

export async function verifyAdminSession(token: string | undefined, now: Date) {
  return (await readAdminSession(token, now)) !== null;
}

/**
 * Compares HMACs of both passwords so the comparison time (and length check)
 * never reveals the password length; false when ADMIN_PASSWORD is unset
 */
export async function checkAdminPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const secret = sessionSecret();
  return safeEqual(
    await hmac(secret, 'admin-pw:' + input),
    await hmac(secret, 'admin-pw:' + expected),
  );
}
