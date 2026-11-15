'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { clientIp, tryDb } from '@/lib/access/admin-request';
import { renderEmail } from '@/lib/access/email-template';
import { offersUnlock } from '@/lib/access/gate';
import { signGuestPass } from '@/lib/access/passwords';
import { recordGuestVisit } from '@/lib/access/repo/guest-access';
import { getStoredLevels } from '@/lib/access/repo/products';
import { isLocked, recordFailure } from '@/lib/access/repo/rate-limit';
import {
  clearSignInCode,
  issueSignInCode,
  verifySignInCode,
} from '@/lib/access/repo/sign-in-codes';
import { safeNext } from '@/lib/access/safe-next';
import { guestSender, sendEmail } from '@/lib/access/send-email';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';
import { getShowcaseProject } from '@/lib/showcase';
import {
  GUEST_PASS_COOKIE,
  guestPassCookieOptions,
} from '@/lib/showcase-access';
import { getSiteUrl } from '@/lib/site';

import { MESSAGES, type SignInState } from './sign-in-messages';

const fieldsSchema = z.object({
  project: z.string().max(100),
  next: z.string().max(2000),
  email: z.string().trim().max(320),
});

function readFields(formData: FormData) {
  return fieldsSchema.safeParse({
    project: String(formData.get('project') ?? ''),
    next: String(formData.get('next') ?? ''),
    email: String(formData.get('email') ?? ''),
  });
}

/** True for a project that is locked right now (falls back to the seed levels) */
function isLockedProject(slug: string) {
  return offersUnlock(slug, () => getStoredLevels(getDb()));
}

async function projectName(slug: string) {
  const project = (await getAllProjects()).find((item) => item.slug === slug);
  return project?.name ?? getShowcaseProject(slug)?.name ?? slug;
}

/** The page the guest came from, with their email filled in for the code step */
function returnLink(slug: string, next: string, email: string) {
  const url = new URL(safeNext(slug, next), getSiteUrl());
  url.searchParams.set('email', email);
  return url.toString();
}

/**
 * Step 1: the visitor gives their email. A guest with active access is sent a
 * code; anyone else is shown the access request form.
 */
export async function startSignIn(
  _state: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const fields = readFields(formData);
  if (!fields.success) return { step: 'email', error: MESSAGES.badEmail };
  const { project: slug, next, email } = fields.data;

  if (!(await isLockedProject(slug))) {
    return { step: 'email', error: MESSAGES.notNeeded };
  }
  if (!z.email().safeParse(email).success) {
    return { step: 'email', email, error: MESSAGES.badEmail };
  }

  // At most 5 tries per visitor every 15 minutes, so the form can't be used
  // to flood an inbox or to test which emails are on the guest list
  const now = new Date();
  const limitKey = `sign-in:${await clientIp()}`;
  if (await tryDb((db) => isLocked(db, limitKey, now))) {
    return { step: 'email', email, error: MESSAGES.tooMany };
  }
  await tryDb((db) => recordFailure(db, limitKey, now));

  const issued = await tryDb((db) => issueSignInCode(db, email, now));
  if (!issued) return { step: 'email', email, error: MESSAGES.outage };
  if (issued.kind === 'unknown') return { step: 'request', email };
  if (issued.kind === 'wait') {
    return {
      step: 'code',
      email,
      retryAfterSeconds: Math.ceil(issued.retryAfterMs / 1000),
    };
  }

  const name = await projectName(slug);
  const sent = await sendEmail({
    // Without a verified sender (local development) the test sender is used
    from: guestSender(),
    to: email,
    subject: `${issued.code} is your sign-in code`,
    ...renderEmail({
      heading: 'Your sign-in code',
      paragraphs: [
        `Enter it on ${name} to continue. It works for 10 minutes.`,
        'If you didn’t ask for this, you can ignore this email.',
      ],
      code: issued.code,
      button: { label: `Open ${name}`, href: returnLink(slug, next, email) },
    }),
  });
  if (!sent) {
    // No email arrived, so don't make them wait a minute to ask again
    await tryDb((db) => clearSignInCode(db, issued.guestId));
    return { step: 'email', email, error: MESSAGES.emailFailed };
  }

  return { step: 'code', email, retryAfterSeconds: 60 };
}

/** Step 2: the guest types the code. The right one signs this device in for a year. */
export async function verifySignIn(
  _state: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const fields = readFields(formData);
  if (!fields.success) return { step: 'email', error: MESSAGES.badEmail };
  const { project: slug, next, email } = fields.data;

  if (!(await isLockedProject(slug))) {
    return { step: 'email', error: MESSAGES.notNeeded };
  }

  const code = String(formData.get('code') ?? '');
  if (!/^\d{6}$/.test(code)) {
    return { step: 'code', email, error: MESSAGES.badCode };
  }

  const now = new Date();
  const result = await tryDb((db) => verifySignInCode(db, email, code, now));
  if (!result) return { step: 'code', email, error: MESSAGES.outage };

  switch (result.kind) {
    case 'unknown':
      return { step: 'request', email };
    case 'expired':
      return { step: 'code', email, error: MESSAGES.expiredCode };
    case 'wrong':
      return {
        step: 'code',
        email,
        error: MESSAGES.wrongCode(result.attemptsLeft),
      };
  }

  (await cookies()).set(
    GUEST_PASS_COOKIE,
    await signGuestPass(result.guestId, result.passwordLookup),
    guestPassCookieOptions(),
  );
  await tryDb((db) => recordGuestVisit(db, result.guestId, now));
  redirect(safeNext(slug, next));
}
