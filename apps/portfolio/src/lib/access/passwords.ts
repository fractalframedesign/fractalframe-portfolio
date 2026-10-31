import { hmac, safeEqual } from "./crypto";
import { WORDS } from "./words";

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
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
  return hmac(sessionSecret(), "password:" + normalizePassword(password));
}

/** `${grantId}.${signature}`; verified by recomputing with the grant's current lookup */
export async function signGuestToken(
  grantId: string,
  slug: string,
  lookup: string,
) {
  const signature = await hmac(
    sessionSecret(),
    ["guest", grantId, slug, lookup].join(":"),
  );
  return `${grantId}.${signature}`;
}

/** Strict: `<grantId>.<64 hex chars>` with exactly one dot, else null */
export function parseGuestToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [grantId = "", signature = ""] = parts;
  if (!grantId || !/^[0-9a-f]{64}$/.test(signature)) return null;
  return { grantId, signature };
}

/** True only if the token was signed for this slug with the grant's current lookup */
export async function verifyGuestToken(
  token: string,
  slug: string,
  lookup: string,
) {
  const parsed = parseGuestToken(token);
  if (!parsed) return false;
  const expected = await signGuestToken(parsed.grantId, slug, lookup);
  return safeEqual(token, expected);
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
  return [...picked, number].join("-");
}

function secureRandom() {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value! / 2 ** 32;
}
