import { hmac, safeEqual } from './crypto';

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return secret;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Guest pass: `${guestId}.${signature}`, one per person for every locked
 * project. Signed with the guest's pass key (the `password_lookup` column),
 * so replacing the key ends every pass.
 */
export async function signGuestPass(guestId: string, lookup: string) {
  const signature = await hmac(
    sessionSecret(),
    ['guest-pass', guestId, lookup].join(':'),
  );
  return `${guestId}.${signature}`;
}

/** Strict: `<uuid>.<64 hex chars>`, else null */
export function parseGuestPass(token: string) {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [guestId = '', signature = ''] = parts;
  if (!UUID.test(guestId) || !/^[0-9a-f]{64}$/.test(signature)) return null;
  return { guestId, signature };
}

/** True only if the pass was signed with the guest's current pass key */
export async function verifyGuestPass(token: string, lookup: string) {
  const parsed = parseGuestPass(token);
  if (!parsed) return false;
  return safeEqual(token, await signGuestPass(parsed.guestId, lookup));
}

/**
 * The guest's pass key: 32 random bytes as hex. It only signs the guest-pass
 * cookie, so nobody ever types it; replacing it signs the guest out everywhere.
 */
export function generatePassKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

/** Six digits, zero-padded, e.g. 048213 */
export function generateSignInCode(random: () => number = secureRandom) {
  return String(Math.floor(random() * 1_000_000)).padStart(6, '0');
}

/** Stored in place of the code itself; tied to the guest so codes can't be swapped */
export async function hashSignInCode(guestId: string, code: string) {
  return hmac(sessionSecret(), `sign-in-code:${guestId}:${code}`);
}

function secureRandom() {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value! / 2 ** 32;
}
