import type { Db } from '@/lib/db/client';
import {
  accessCookieName,
  guestCookieName,
  hasAccess,
} from '@/lib/showcase-access';

import { ADMIN_COOKIE, verifyAdminSession } from './admin-session';
import { decideAccess } from './decide';
import { type AccessLevel, canBeUnlocked, resolveLevel } from './levels';
import { parseGuestToken, verifyGuestToken } from './passwords';
import { getStoredLevels } from './repo/products';

export type GateDeps = {
  getLevels(): Promise<Map<string, AccessLevel>>;
  getGrantForToken(
    grantId: string,
    slug: string,
    now: Date,
  ): Promise<{ passwordLookup: string; active: boolean } | null>;
  now(): Date;
};

export type GateResult =
  | { kind: 'next' }
  | { kind: 'allow'; recordVisit?: string }
  | { kind: 'unlock'; slug: string }
  | { kind: 'not-found' };

type GateInput = {
  pathname: string;
  cookies: { get(name: string): string | undefined };
  deps: GateDeps;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

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

  // Project pages only hide Admin projects; Unlocked ones stay listed
  if (section === 'projects') {
    const hidden = level === 'admin' || level === 'unknown-db-down';
    return hidden && !isAdmin ? { kind: 'not-found' } : { kind: 'next' };
  }

  if (level === 'public') return { kind: 'allow' };
  if (level === 'admin')
    return isAdmin ? { kind: 'allow' } : { kind: 'not-found' };

  const guestGrant =
    level === 'unlocked' && !isAdmin
      ? await validGuestGrant(slug, cookies.get(guestCookieName(slug)), deps)
      : null;
  const hasFallbackAccess =
    !isAdmin && !guestGrant
      ? await hasAccess(slug, cookies.get(accessCookieName(slug)))
      : false;

  const decision = decideAccess({
    level,
    isAdmin,
    hasGuestAccess: Boolean(guestGrant),
    hasFallbackAccess,
  });

  if (decision === 'allow')
    return guestGrant
      ? { kind: 'allow', recordVisit: guestGrant }
      : { kind: 'allow' };
  if (decision === 'unlock') return { kind: 'unlock', slug };
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

/** Returns the grant id when the guest cookie is valid right now */
async function validGuestGrant(
  slug: string,
  token: string | undefined,
  deps: GateDeps,
) {
  const parsed = token ? parseGuestToken(token) : null;
  if (!token || !parsed || !UUID.test(parsed.grantId)) return null;

  try {
    const grant = await deps.getGrantForToken(parsed.grantId, slug, deps.now());
    if (!grant?.active) return null;
    return (await verifyGuestToken(token, slug, grant.passwordLookup))
      ? parsed.grantId
      : null;
  } catch {
    return null;
  }
}

const LEVEL_TTL_MS = 10_000;
let levelCache: { at: number; levels: Map<string, AccessLevel> } | undefined;

/** Project levels for the proxy, cached for 10 seconds; failures are not cached */
export async function getProxyLevels(db: Db, now = Date.now()) {
  if (levelCache && now - levelCache.at < LEVEL_TTL_MS)
    return levelCache.levels;
  const levels = await getStoredLevels(db);
  levelCache = { at: now, levels };
  return levels;
}

/**
 * Whether the unlock form should be offered for a project: only for Unlocked
 * projects. If levels can't be read, offer it for showcase projects that could
 * be Unlocked, since SHOWCASE_ACCESS passwords still work.
 */
export async function offersUnlock(
  slug: string,
  getLevels: () => Promise<Map<string, AccessLevel>>,
) {
  try {
    return resolveLevel(slug, await getLevels()) === 'unlocked';
  } catch {
    return canBeUnlocked(slug);
  }
}
