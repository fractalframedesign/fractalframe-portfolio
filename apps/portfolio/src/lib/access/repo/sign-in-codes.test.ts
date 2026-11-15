import { beforeEach, expect, test } from 'vitest';

import type { Db } from '@/lib/db/client';
import { createTestDb } from '@/lib/db/test-db';

import { getGuestPass, inviteGuest, setGuestStatus } from './guest-access';
import {
  clearSignInCode,
  CODE_TTL_MS,
  issueSignInCode,
  MAX_CODE_ATTEMPTS,
  RESEND_WAIT_MS,
  verifySignInCode,
} from './sign-in-codes';

const EMAIL = 'ada@example.com';
const now = new Date('2026-11-14T00:00:00Z');
const after = (ms: number) => new Date(now.getTime() + ms);

let db: Db;
let guestId: string;
beforeEach(async () => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret';
  db = await createTestDb();
  ({ guestId } = await inviteGuest(db, {
    name: 'Ada Lovelace',
    email: EMAIL,
    expiresAt: null,
  }));
});

/** Sends a code and returns it, failing the test if none was sent */
async function sendCode(email = EMAIL, at = now) {
  const issued = await issueSignInCode(db, email, at);
  if (issued.kind !== 'sent')
    throw new Error(`expected sent, got ${issued.kind}`);
  return issued;
}

/** A six-digit code that is never the right one */
function wrongFor(code: string) {
  return code === '000000' ? '000001' : '000000';
}

test('the limits are the agreed ones', () => {
  expect(CODE_TTL_MS).toBe(600_000);
  expect(RESEND_WAIT_MS).toBe(60_000);
  expect(MAX_CODE_ATTEMPTS).toBe(5);
});

test('an active guest gets a six-digit code that verifies once', async () => {
  const issued = await sendCode();
  expect(issued).toMatchObject({ guestId, name: 'Ada Lovelace' });
  expect(issued.code).toMatch(/^\d{6}$/);

  const pass = await getGuestPass(db, guestId, now);
  expect(await verifySignInCode(db, EMAIL, issued.code, after(1000))).toEqual({
    kind: 'ok',
    guestId,
    passwordLookup: pass?.passwordLookup,
  });
  expect(await verifySignInCode(db, EMAIL, issued.code, after(2000))).toEqual({
    kind: 'expired',
  });
});

test('emails match ignoring case and spaces', async () => {
  const { code } = await sendCode('Ada@Example.com ');
  expect(
    await verifySignInCode(db, ' ADA@example.com', code, after(1000)),
  ).toMatchObject({ kind: 'ok', guestId });
});

test('unknown, paused and expired guests get unknown', async () => {
  const unknown = { kind: 'unknown' };
  expect(await issueSignInCode(db, 'nobody@example.com', now)).toEqual(unknown);
  expect(await issueSignInCode(db, '   ', now)).toEqual(unknown);
  expect(
    await verifySignInCode(db, 'nobody@example.com', '123456', now),
  ).toEqual(unknown);

  await setGuestStatus(db, guestId, 'paused');
  expect(await issueSignInCode(db, EMAIL, now)).toEqual(unknown);
  expect(await verifySignInCode(db, EMAIL, '123456', now)).toEqual(unknown);

  await inviteGuest(db, {
    name: 'Bo',
    email: 'bo@example.com',
    expiresAt: after(1000),
  });
  expect(await issueSignInCode(db, 'bo@example.com', after(2000))).toEqual(
    unknown,
  );
  expect(
    await verifySignInCode(db, 'bo@example.com', '123456', after(2000)),
  ).toEqual(unknown);
});

test('a second code within 60 seconds is refused with the wait left', async () => {
  const first = await sendCode();
  expect(await issueSignInCode(db, EMAIL, after(10_000))).toEqual({
    kind: 'wait',
    retryAfterMs: 50_000,
  });
  // The first code is untouched by the refused request
  expect(
    await verifySignInCode(db, EMAIL, first.code, after(11_000)),
  ).toMatchObject({ kind: 'ok' });
});

test('a new code replaces the old one', async () => {
  const first = await sendCode();
  let second = await sendCode(EMAIL, after(61_000));
  // One time in a million the same digits come up twice: ask once more
  if (second.code === first.code) {
    second = await sendCode(EMAIL, after(122_000));
  }

  expect(await verifySignInCode(db, EMAIL, first.code, after(130_000))).toEqual(
    { kind: 'wrong', attemptsLeft: 4 },
  );
  expect(
    await verifySignInCode(db, EMAIL, second.code, after(131_000)),
  ).toMatchObject({ kind: 'ok' });
});

test('codes expire after 10 minutes', async () => {
  const { code } = await sendCode();
  expect(
    await verifySignInCode(db, EMAIL, code, after(CODE_TTL_MS + 1)),
  ).toEqual({ kind: 'expired' });
});

test('five wrong tries kill the code', async () => {
  const { code } = await sendCode();
  for (const attemptsLeft of [4, 3, 2, 1, 0]) {
    expect(
      await verifySignInCode(db, EMAIL, wrongFor(code), after(1000)),
    ).toEqual({ kind: 'wrong', attemptsLeft });
  }
  expect(await verifySignInCode(db, EMAIL, code, after(2000))).toEqual({
    kind: 'expired',
  });
});

test('a new code starts with five fresh tries', async () => {
  const first = await sendCode();
  await verifySignInCode(db, EMAIL, wrongFor(first.code), after(1000));
  const second = await sendCode(EMAIL, after(61_000));
  expect(
    await verifySignInCode(db, EMAIL, wrongFor(second.code), after(62_000)),
  ).toEqual({ kind: 'wrong', attemptsLeft: 4 });
});

test('a guest paused after asking is refused at verify', async () => {
  const { code } = await sendCode();
  await setGuestStatus(db, guestId, 'paused');
  expect(await verifySignInCode(db, EMAIL, code, after(1000))).toEqual({
    kind: 'unknown',
  });
});

test('a cleared code stops working and another can be sent straight away', async () => {
  const { code } = await sendCode();
  await clearSignInCode(db, guestId);
  expect(await verifySignInCode(db, EMAIL, code, after(1000))).toEqual({
    kind: 'expired',
  });
  expect((await issueSignInCode(db, EMAIL, after(2000))).kind).toBe('sent');
});
