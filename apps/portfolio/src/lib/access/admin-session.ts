import { hmac, safeEqual } from './crypto';

export const ADMIN_COOKIE = 'admin-session';
const SESSION_SECONDS = 12 * 60 * 60;

export function adminCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_SECONDS,
  };
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return secret;
}

export async function createAdminSession(now: Date) {
  const expiresAtMs = now.getTime() + SESSION_SECONDS * 1000;
  return `${expiresAtMs}.${await hmac(sessionSecret(), 'admin:' + expiresAtMs)}`;
}

export async function verifyAdminSession(token: string | undefined, now: Date) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [expiresAt, signature, ...rest] = token.split('.');
  if (!expiresAt || !signature || rest.length || !/^\d+$/.test(expiresAt))
    return false;
  if (Number(expiresAt) <= now.getTime()) return false;

  return safeEqual(
    signature,
    await hmac(sessionSecret(), 'admin:' + expiresAt),
  );
}

/** Constant-time compare against ADMIN_PASSWORD; false when it is unset */
export function checkAdminPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}
