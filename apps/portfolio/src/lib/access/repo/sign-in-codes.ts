import { and, eq, sql } from 'drizzle-orm';

import type { Db } from '@/lib/db/client';
import { guests } from '@/lib/db/schema';

import { safeEqual } from '../crypto';
import { generateSignInCode, hashSignInCode } from '../passwords';
import { isAccessActive, normalizeEmail } from './guest-access';

/** How long a code works */
export const CODE_TTL_MS = 10 * 60_000;
/** The wait between two codes for the same guest */
export const RESEND_WAIT_MS = 60_000;
/** Wrong tries before a code is cancelled */
export const MAX_CODE_ATTEMPTS = 5;

const NO_CODE = {
  signInCodeHash: null,
  signInCodeExpiresAt: null,
  signInCodeAttempts: 0,
  signInCodeSentAt: null,
};

export type IssueResult =
  | { kind: 'sent'; guestId: string; name: string; code: string }
  | { kind: 'wait'; retryAfterMs: number }
  | { kind: 'unknown' };

export type VerifyResult =
  | { kind: 'ok'; guestId: string; passwordLookup: string }
  | { kind: 'wrong'; attemptsLeft: number }
  | { kind: 'expired' }
  | { kind: 'unknown' };

/** The guest with this email, only while their access is active */
async function activeGuestByEmail(db: Db, email: string, now: Date) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const [guest] = await db
    .select({
      id: guests.id,
      name: guests.name,
      passwordLookup: guests.passwordLookup,
      status: guests.accessStatus,
      expiresAt: guests.accessExpiresAt,
      codeHash: guests.signInCodeHash,
      codeExpiresAt: guests.signInCodeExpiresAt,
      codeAttempts: guests.signInCodeAttempts,
      codeSentAt: guests.signInCodeSentAt,
    })
    .from(guests)
    .where(eq(guests.email, normalized));
  return guest && isAccessActive(guest, now) ? guest : null;
}

/**
 * Makes a new code for an active guest and stores only its hash. The caller
 * emails the returned code; it replaces any earlier one.
 */
export async function issueSignInCode(
  db: Db,
  email: string,
  now: Date,
): Promise<IssueResult> {
  const guest = await activeGuestByEmail(db, email, now);
  if (!guest) return { kind: 'unknown' };

  if (guest.codeSentAt) {
    const waited = now.getTime() - guest.codeSentAt.getTime();
    if (waited < RESEND_WAIT_MS) {
      return { kind: 'wait', retryAfterMs: RESEND_WAIT_MS - waited };
    }
  }

  const code = generateSignInCode();
  await db
    .update(guests)
    .set({
      signInCodeHash: await hashSignInCode(guest.id, code),
      signInCodeExpiresAt: new Date(now.getTime() + CODE_TTL_MS),
      signInCodeAttempts: 0,
      signInCodeSentAt: now,
    })
    .where(eq(guests.id, guest.id));
  return { kind: 'sent', guestId: guest.id, name: guest.name, code };
}

/**
 * Checks the code a guest typed. The right one works once; each wrong one
 * uses up a try, and the fifth cancels the code.
 */
export async function verifySignInCode(
  db: Db,
  email: string,
  code: string,
  now: Date,
): Promise<VerifyResult> {
  const guest = await activeGuestByEmail(db, email, now);
  if (!guest) return { kind: 'unknown' };

  if (
    !guest.codeHash ||
    !guest.codeExpiresAt ||
    now.getTime() > guest.codeExpiresAt.getTime() ||
    guest.codeAttempts >= MAX_CODE_ATTEMPTS
  ) {
    return { kind: 'expired' };
  }

  if (!safeEqual(await hashSignInCode(guest.id, code), guest.codeHash)) {
    // Counted in the database, so tries sent at the same moment all count
    const [row] = await db
      .update(guests)
      .set({ signInCodeAttempts: sql`${guests.signInCodeAttempts} + 1` })
      .where(eq(guests.id, guest.id))
      .returning({ attempts: guests.signInCodeAttempts });
    const attempts = row?.attempts ?? MAX_CODE_ATTEMPTS;
    return {
      kind: 'wrong',
      attemptsLeft: Math.max(0, MAX_CODE_ATTEMPTS - attempts),
    };
  }

  // Used up only if it is still the current code, so it can't be used twice
  const used = await db
    .update(guests)
    .set(NO_CODE)
    .where(
      and(eq(guests.id, guest.id), eq(guests.signInCodeHash, guest.codeHash)),
    )
    .returning({ id: guests.id });
  if (used.length === 0) return { kind: 'expired' };

  return {
    kind: 'ok',
    guestId: guest.id,
    passwordLookup: guest.passwordLookup,
  };
}

/** Cancels the current code, e.g. when its email could not be sent */
export async function clearSignInCode(db: Db, guestId: string) {
  await db.update(guests).set(NO_CODE).where(eq(guests.id, guestId));
}
