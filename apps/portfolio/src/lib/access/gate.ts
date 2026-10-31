import type { Db } from '@/lib/db/client';
import {
  accessCookieName,
  GUEST_PASS_COOKIE,
  hasAccess,
} from '@/lib/showcase-access';

import { ADMIN_COOKIE, verifyAdminSession } from './admin-session';
import { decideAccess } from './decide';
import { type AccessLevel, resolveLevel, SEED_LEVELS } from './levels';
import { parseGuestPass, verifyGuestPass } from './passwords';
import { getStoredLevels } from './repo/products';

export type GateDeps = {
  getLevels(): Promise<Map<string, AccessLevel>>;
  getGuestPass(
    guestId: string,
    now: Date,
  ): Promise<{ passwordLookup: string; active: boolean } | null>;
  now(): Date;
};

export type GateResult =
  | { kind: 'next' }
  /** recordVisit: the guest id whose pass opened the page */
  | { kind: 'allow'; recordVisit?: string }
  | { kind: 'unlock'; slug: string; section: 'projects' | 'showcase' }
  | { kind: 'not-found' };

type GateInput = {
  pathname: string;
  cookies: { get(name: string): string | undefined };
  deps: GateDeps;
};

/**
 * Decides what the proxy does with a /showcase or /projects request.
 * Fails closed: a database error never makes a project more visible.
 */
export async function gateRequest({
  pathname,
  cookies,
  deps,
}: GateInput): Promise<GateResult> {
  // Empty segments are dropped so /showcase//slug is gated like /showcase/slug
  const [section, slug] = pathname.split('/').filter(Boolean);
  if (!slug) return { kind: 'next' };
  if (section === 'showcase' && slug === 'unlock') return { kind: 'next' };
  if (section !== 'showcase' && section !== 'projects') return { kind: 'next' };

  const now = deps.now();
  const level = await levelOf(slug, deps);
  const isAdmin = await verifyAdminSession(cookies.get(ADMIN_COOKIE), now);

  // Public pages need no cookie, so the proxy adds no no-store header
  if (level === 'public') return { kind: 'next' };
  if (level === 'admin')
    return isAdmin ? { kind: 'allow' } : { kind: 'not-found' };

  const guestId =
    level === 'unlocked' && !isAdmin
      ? await validGuestPass(cookies.get(GUEST_PASS_COOKIE), deps)
      : null;
  const hasFallbackAccess =
    !isAdmin && !guestId
      ? await hasAccess(slug, cookies.get(accessCookieName(slug)))
      : false;

  const decision = decideAccess({
    level,
    isAdmin,
    hasGuestAccess: Boolean(guestId),
    hasFallbackAccess,
  });

  if (decision === 'allow')
    return guestId
      ? { kind: 'allow', recordVisit: guestId }
      : { kind: 'allow' };
  if (decision === 'unlock') return { kind: 'unlock', slug, section };
  return { kind: 'not-found' };
}

async function levelOf(
  slug: string,
  deps: GateDeps,
): Promise<AccessLevel | 'unknown-db-down'> {
  try {
    return resolveLevel(slug, await deps.getLevels());
  } catch {
    return 'unknown-db-down';
  }
}

/** Returns the guest id when the pass cookie is valid right now */
async function validGuestPass(token: string | undefined, deps: GateDeps) {
  const parsed = token ? parseGuestPass(token) : null;
  if (!token || !parsed) return null;

  try {
    const pass = await deps.getGuestPass(parsed.guestId, deps.now());
    if (!pass?.active) return null;
    return (await verifyGuestPass(token, pass.passwordLookup))
      ? parsed.guestId
      : null;
  } catch {
    return null;
  }
}

const LEVEL_TTL_MS = 10_000;
let levelCache: { at: number; levels: Map<string, AccessLevel> } | undefined;

/** By name, so it also matches across module instances (and in mocked tests) */
function isDatabaseUnset(error: unknown) {
  return error instanceof Error && error.name === 'DatabaseUnavailableError';
}

export function seedLevels() {
  return new Map(Object.entries(SEED_LEVELS));
}

/**
 * Project levels for the proxy, cached for 10 seconds. Failures are never cached:
 * - DATABASE_URL unset (local dev): the seed levels.
 * - Database down: the last levels this instance read, however old.
 * - Down with nothing read yet: rethrows, so the gate fails closed.
 */
export async function getProxyLevels(getDb: () => Db, now = Date.now()) {
  if (levelCache && now - levelCache.at < LEVEL_TTL_MS)
    return levelCache.levels;
  try {
    const levels = await getStoredLevels(getDb());
    levelCache = { at: now, levels };
    return levels;
  } catch (error) {
    if (isDatabaseUnset(error)) return seedLevels();
    if (levelCache) return levelCache.levels;
    throw error;
  }
}

/**
 * Whether the unlock form should be offered for a project: only for Unlocked
 * projects. With DATABASE_URL unset, or the database down, the seed levels
 * decide (SHOWCASE_ACCESS passwords still work for those).
 */
export async function offersUnlock(
  slug: string,
  getLevels: () => Promise<Map<string, AccessLevel>>,
) {
  try {
    return resolveLevel(slug, await getLevels()) === 'unlocked';
  } catch {
    return resolveLevel(slug, seedLevels()) === 'unlocked';
  }
}
