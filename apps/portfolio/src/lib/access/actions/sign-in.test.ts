import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  getGuest,
  inviteGuest,
  setGuestStatus,
} from '@/lib/access/repo/guest-access';
import { seedProducts } from '@/lib/access/repo/products';
import type { Db } from '@/lib/db/client';
import { products } from '@/lib/db/schema';
import { createTestDb } from '@/lib/db/test-db';
import { GUEST_PASS_COOKIE } from '@/lib/showcase-access';

import { startSignIn, verifySignIn } from './sign-in';

type CookieOptions = { path?: string; maxAge?: number; httpOnly?: boolean };

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  dbDown: false,
  cookies: new Map<string, { value: string; options?: object }>(),
  ip: '203.0.113.7',
}));

vi.mock('@/lib/db/client', () => ({
  getDb: () => {
    if (state.dbDown) throw new Error('DATABASE_URL is not set');
    return state.db;
  },
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    set: (name: string, value: string, options?: object) => {
      state.cookies.set(name, { value, options });
    },
  }),
  headers: async () =>
    new Headers({ 'x-forwarded-for': `${state.ip}, 10.0.0.1` }),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const SLUG = 'fintech-components';
/** A case study without a live demo */
const CASE_STUDY = 'cactus-plant';
const EMAIL = 'ada@example.com';

type ResendBody = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

let fetchMock: ReturnType<typeof vi.fn>;
let emailStatus = 200;
let guestId: string;

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function start(email: string, extra: Record<string, string> = {}) {
  return startSignIn(
    { step: 'email' },
    form({ project: SLUG, next: `/showcase/${SLUG}/docs`, email, ...extra }),
  );
}

function verify(code: string, extra: Record<string, string> = {}) {
  return verifySignIn(
    { step: 'code', email: EMAIL },
    form({
      project: SLUG,
      next: `/showcase/${SLUG}/docs`,
      email: EMAIL,
      code,
      ...extra,
    }),
  );
}

/** The emails Resend was asked to send, oldest first */
function sentEmails(): ResendBody[] {
  return fetchMock.mock.calls.map(
    (call) => JSON.parse((call[1] as RequestInit).body as string) as ResendBody,
  );
}

/** Reads the code the way a guest does: from the email */
function emailedCode() {
  const code = sentEmails()
    .at(-1)
    ?.text.match(/Your code: (\d{6})/)?.[1];
  if (!code) throw new Error('no code was emailed');
  return code;
}

function wrongFor(code: string) {
  return code === '000000' ? '000001' : '000000';
}

beforeEach(async () => {
  const db: Db = await createTestDb();
  await seedProducts(db);
  state.db = db;
  state.dbDown = false;
  state.ip = '203.0.113.7';
  state.cookies.clear();
  await db
    .update(products)
    .set({ level: 'unlocked' })
    .where(eq(products.slug, CASE_STUDY));
  ({ guestId } = await inviteGuest(db, {
    name: 'Ada Lovelace',
    email: EMAIL,
    expiresAt: null,
  }));

  process.env.ADMIN_SESSION_SECRET = 'test-secret';
  process.env.RESEND_API_KEY = 'test-key';
  process.env.ACCESS_REQUEST_FROM = 'Kiran <hello@example.com>';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  emailStatus = 200;
  fetchMock = vi.fn(async () => new Response('{}', { status: emailStatus }));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.RESEND_API_KEY;
  delete process.env.ACCESS_REQUEST_FROM;
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe('startSignIn', () => {
  test('an approved guest gets a code email and the code step', async () => {
    expect(await start(' Ada@Example.com ')).toEqual({
      step: 'code',
      email: 'Ada@Example.com',
      retryAfterSeconds: 60,
    });

    const [email] = sentEmails();
    const code = emailedCode();
    expect(email).toMatchObject({
      from: 'Kiran <hello@example.com>',
      to: 'Ada@Example.com',
      subject: `${code} is your sign-in code`,
    });
    expect(email?.html).toContain(`>${code}<`);
    expect(email?.html).toContain('Enter it on Fintech Components');
    expect(email?.html).toContain(
      `href="https://example.com/showcase/${SLUG}/docs?email=Ada%40Example.com"`,
    );
    expect(email?.text).toContain('It works for 10 minutes.');
  });

  test('an unknown email goes to the request step without an email', async () => {
    expect(await start('nobody@example.com')).toEqual({
      step: 'request',
      email: 'nobody@example.com',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('a paused guest goes to the request step', async () => {
    await setGuestStatus(state.db as Db, guestId, 'paused');
    expect(await start(EMAIL)).toEqual({ step: 'request', email: EMAIL });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('a second code within a minute is the wait, not a new email', async () => {
    await start(EMAIL);
    const again = await start(EMAIL);
    expect(again).toMatchObject({ step: 'code', email: EMAIL });
    expect(again.error).toBeUndefined();
    expect(again.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(again.retryAfterSeconds).toBeLessThanOrEqual(60);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test('a bad email address stays on the email step', async () => {
    expect(await start('not-an-email')).toEqual({
      step: 'email',
      email: 'not-an-email',
      error: 'Enter a valid email address.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('projects that are not Unlocked send nothing', async () => {
    expect(await start(EMAIL, { project: 'bloom' })).toEqual({
      step: 'email',
      error: 'This project doesn’t need a password.',
    });
    expect(await start(EMAIL, { project: '../../etc/passwd' })).toEqual({
      step: 'email',
      error: 'This project doesn’t need a password.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('the email button never leaves the project', async () => {
    await start(EMAIL, { project: CASE_STUDY, next: '//evil.com/x?email=z' });
    expect(sentEmails()[0]?.html).toContain(
      `href="https://example.com/projects/${CASE_STUDY}?email=ada%40example.com"`,
    );
  });

  test('when the email fails to send, the guest can try again straight away', async () => {
    emailStatus = 500;
    expect(await start(EMAIL)).toEqual({
      step: 'email',
      email: EMAIL,
      error: 'The email didn’t send. Try again.',
    });

    emailStatus = 200;
    expect(await start(EMAIL)).toMatchObject({
      step: 'code',
      retryAfterSeconds: 60,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('more than five code requests per visitor in 15 minutes are refused', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await start(`nobody${i}@example.com`)).step).toBe('request');
    }
    expect(await start(EMAIL)).toEqual({
      step: 'email',
      email: EMAIL,
      error: 'Too many codes requested. Try again in 15 minutes.',
    });
    expect(fetchMock).not.toHaveBeenCalled();

    state.ip = '198.51.100.9';
    expect((await start(EMAIL)).step).toBe('code');
  });

  test('database down reports an outage', async () => {
    state.dbDown = true;
    expect(await start(EMAIL)).toEqual({
      step: 'email',
      email: EMAIL,
      error:
        'We can’t send codes right now. Please try again in a few minutes.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('verifySignIn', () => {
  test('the right code sets a one-year guest pass and redirects within the project', async () => {
    await start(EMAIL);
    await expect(
      verify(emailedCode(), { project: CASE_STUDY, next: '//evil.com' }),
    ).rejects.toThrow(`REDIRECT:/projects/${CASE_STUDY}`);

    const cookie = state.cookies.get(GUEST_PASS_COOKIE);
    expect(cookie?.value).toMatch(/^[0-9a-f-]{36}\.[0-9a-f]{64}$/);
    expect(cookie?.value.startsWith(`${guestId}.`)).toBe(true);
    expect(cookie?.options as CookieOptions).toMatchObject({
      path: '/',
      httpOnly: true,
      maxAge: 31_536_000,
    });
    expect((await getGuest(state.db as Db, guestId))?.visitCount).toBe(1);
  });

  test('the email is matched ignoring case and spaces', async () => {
    await start(EMAIL);
    await expect(
      verify(emailedCode(), { email: ' ADA@example.com ' }),
    ).rejects.toThrow(`REDIRECT:/showcase/${SLUG}/docs`);
  });

  test('a code works only once', async () => {
    await start(EMAIL);
    const code = emailedCode();
    await expect(verify(code)).rejects.toThrow('REDIRECT:');
    state.cookies.clear();
    expect(await verify(code)).toEqual({
      step: 'code',
      email: EMAIL,
      error: 'That code has expired. Request a new one.',
    });
    expect(state.cookies.size).toBe(0);
  });

  test('a wrong code says how many tries are left', async () => {
    await start(EMAIL);
    const code = emailedCode();
    const errors: (string | undefined)[] = [];
    for (let i = 0; i < 5; i++) {
      errors.push((await verify(wrongFor(code))).error);
    }
    expect(errors).toEqual([
      'That code isn’t right. 4 tries left.',
      'That code isn’t right. 3 tries left.',
      'That code isn’t right. 2 tries left.',
      'That code isn’t right. 1 try left.',
      'That code has been used up. Request a new one.',
    ]);
    expect(await verify(code)).toMatchObject({
      step: 'code',
      error: 'That code has expired. Request a new one.',
    });
    expect(state.cookies.size).toBe(0);
  });

  test('an expired code asks for a new one', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-14T00:00:00Z'));
    await start(EMAIL);
    const code = emailedCode();

    vi.setSystemTime(new Date('2026-11-14T00:10:01Z'));
    expect(await verify(code)).toEqual({
      step: 'code',
      email: EMAIL,
      error: 'That code has expired. Request a new one.',
    });
  });

  test('anything but six digits is refused before the database is asked', async () => {
    await start(EMAIL);
    for (const code of ['', '12345', '1234567', 'abcdef', '12 456']) {
      expect(await verify(code)).toEqual({
        step: 'code',
        email: EMAIL,
        error: 'Enter the 6-digit code.',
      });
    }
    // None of those used up a try
    await expect(verify(emailedCode())).rejects.toThrow('REDIRECT:');
  });

  test('a guest paused after asking goes to the request step', async () => {
    await start(EMAIL);
    await setGuestStatus(state.db as Db, guestId, 'paused');
    expect(await verify(emailedCode())).toEqual({
      step: 'request',
      email: EMAIL,
    });
    expect(state.cookies.size).toBe(0);
  });

  test('database down reports an outage', async () => {
    await start(EMAIL);
    const code = emailedCode();
    state.dbDown = true;
    expect(await verify(code)).toEqual({
      step: 'code',
      email: EMAIL,
      error:
        'We can’t send codes right now. Please try again in a few minutes.',
    });
  });
});
