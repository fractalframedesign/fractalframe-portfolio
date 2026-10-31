import { hmac, safeEqual } from './crypto';
import { WORDS } from './words';

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return secret;
}

export function normalizePassword(input: string) {
  return input.trim().toLowerCase();
}

/**
 * Deterministic lookup key for a guest password, so the unlock form can find
 * the guest by it. Safe because passwords are random and the key is server-only.
 * Rotating ADMIN_SESSION_SECRET invalidates every guest password.
 */
export async function passwordLookup(password: string) {
  return hmac(sessionSecret(), 'password:' + normalizePassword(password));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Guest pass: `${guestId}.${signature}`, one per person for every locked
 * project. Signed with the guest's current lookup, so a new password ends it.
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

/** True only if the pass was signed with the guest's current lookup */
export async function verifyGuestPass(token: string, lookup: string) {
  const parsed = parseGuestPass(token);
  if (!parsed) return false;
  return safeEqual(token, await signGuestPass(parsed.guestId, lookup));
}

/** Three distinct words and a number from 10 to 99, e.g. amber-river-42 */
export function generatePassword(random: () => number = secureRandom) {
  const pool = [...WORDS];
  const picked: string[] = [];
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0]!);
  }
  const number = 10 + Math.floor(random() * 90);
  return [...picked, number].join('-');
}

function secureRandom() {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value! / 2 ** 32;
}
