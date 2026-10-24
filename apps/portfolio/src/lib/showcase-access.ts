import { PROTECTED_SHOWCASE } from '@/lib/constants';

/**
 * One entry per person, read from SHOWCASE_ACCESS:
 *   name:password:project+project, name2:password2:*
 * `*` opens every protected project. Delete an entry to revoke it.
 */
type AccessEntry = {
  name: string;
  password: string;
  projects: string[] | '*';
};

/** Query param that carries the one-page pass */
export const ACCESS_PARAM = 'access';

/** How long a pass works after the password is entered. Nothing is stored, so every visit needs the password */
const ACCESS_TTL_MS = 30_000;

const encoder = new TextEncoder();

/** Returns the protected project slug a /showcase path belongs to, if any */
export function getProtectedSlug(pathname: string) {
  const slug = pathname.split('/')[2];
  return slug && PROTECTED_SHOWCASE.includes(slug) ? slug : undefined;
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

/** HMAC of the message keyed by the password, so removing a password voids its passes */
async function sign(password: string, message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message),
  );

  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

/** Returns a short-lived pass for a correct password, or undefined */
export async function createAccessPass(slug: string, password: string) {
  if (!password) return undefined;

  const given = await sign(password, slug);
  for (const entry of getEntries(slug)) {
    if (safeEqual(given, await sign(entry.password, slug))) {
      const expires = Date.now() + ACCESS_TTL_MS;
      return `${expires}.${await sign(entry.password, `${slug}:${expires}`)}`;
    }
  }
}

export async function verifyAccessPass(slug: string, pass: string | null) {
  const [expiresRaw, signature] = pass?.split('.') ?? [];
  const expires = Number(expiresRaw);
  if (!signature || !(expires > Date.now())) return false;

  for (const entry of getEntries(slug)) {
    const expected = await sign(entry.password, `${slug}:${expires}`);
    if (safeEqual(signature, expected)) return true;
  }
  return false;
}

/** Constant-time string comparison */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
