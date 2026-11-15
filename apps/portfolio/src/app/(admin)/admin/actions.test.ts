import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createAdminSession } from '@/lib/access/admin-session';
import { LEVELS_TAG } from '@/lib/access/cached-levels';
import {
  findGuestByEmail,
  getGuest,
  getGuestPass,
  inviteGuest,
} from '@/lib/access/repo/guest-access';
import { getStoredLevels, seedProducts } from '@/lib/access/repo/products';
import { listPendingRequests, saveRequest } from '@/lib/access/repo/requests';
import type { Db } from '@/lib/db/client';
import { createTestDb } from '@/lib/db/test-db';

import {
  addGuest,
  changeGuestExpiry,
  declineRequest,
  deleteGuest,
  guestMessage,
  resumeGuest,
  sendInvite,
  setGuestAccessStatus,
  setProjectLevel,
  signOutEverywhere,
  updateGuest,
} from './actions';

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  token: undefined as string | undefined,
}));

const cache = vi.hoisted(() => ({
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: <T>(fn: T) => fn,
}));

vi.mock('@/lib/db/client', () => ({ getDb: () => state.db }));

// Lets a test make the project list fail before anything is written
const content = vi.hoisted(() => ({ fail: false }));
vi.mock('@/lib/projects', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/projects')>();
  return {
    ...original,
    getAllProjects: async () => {
      if (content.fail) throw new Error('content failed');
      return original.getAllProjects();
    },
  };
});

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'admin-session' && state.token
        ? { name, value: state.token }
        : undefined,
    delete: () => {},
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

vi.mock('next/cache', () => cache);

function db() {
  return state.db as Db;
}

function guestAda() {
  return findGuestByEmail(db(), 'ada@example.com');
}

function guestForm(fields: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const item of [value].flat()) data.append(key, item);
  }
  return data;
}

const ada = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  note: 'Met at a meetup',
  expiry: '24h',
};

beforeEach(async () => {
  state.db = await createTestDb();
  await seedProducts(db());
  state.token = await createAdminSession(new Date());
  cache.updateTag.mockClear();
  cache.revalidatePath.mockClear();
});

describe('without an admin session', () => {
  test('actions redirect to login and change nothing', async () => {
    state.token = undefined;

    await expect(addGuest(guestForm(ada))).rejects.toThrow(
      'REDIRECT:/admin/login',
    );
    await expect(
      sendInvite('11111111-1111-4111-8111-111111111111', {
        subject: 's',
        message: 'm',
      }),
    ).rejects.toThrow('REDIRECT:/admin/login');
    await expect(
      setProjectLevel('fintech-components', 'admin'),
    ).rejects.toThrow('REDIRECT:/admin/login');

    expect(await guestAda()).toBeUndefined();
    expect((await getStoredLevels(db())).get('fintech-components')).toBe(
      'unlocked',
    );
    expect(cache.updateTag).not.toHaveBeenCalled();
  });
});

describe('addGuest', () => {
  test('creates one guest for every locked project with a reply and no password', async () => {
    const result = await addGuest(guestForm(ada));
    if (!result.ok) throw new Error('expected ok');

    expect(result.renewed).toBe(false);
    expect(result.reply).toContain('Hi Ada,');
    expect(result.reply).toContain('a 6-digit code will arrive');
    expect(result.reply).not.toContain('Password:');
    expect(result).not.toHaveProperty('password');
    expect(await guestAda()).toMatchObject({
      name: 'Ada Lovelace',
      status: 'active',
    });
    expect((await guestAda())?.expiresAt).not.toBeNull();
  });

  test('a custom expiry in the past is a field error', async () => {
    const result = await addGuest(
      guestForm({ ...ada, expiry: 'custom', expiryCustom: '2020-01-01T09:00' }),
    );
    expect(result).toEqual({
      ok: false,
      fieldErrors: { expiryCustom: ['Pick a time in the future.'] },
    });
    expect(await guestAda()).toBeUndefined();
  });

  test('a blank name is a field error', async () => {
    const result = await addGuest(guestForm({ ...ada, name: '   ' }));
    if (result.ok) throw new Error('expected error');
    expect(result.fieldErrors?.name).toBeDefined();
  });

  test('with a requestId it marks the request approved', async () => {
    await saveRequest(db(), {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello',
      productSlug: 'fintech-components',
    });
    const [request] = await listPendingRequests(db());

    const result = await addGuest(
      guestForm({ ...ada, requestId: request!.id }),
    );
    expect(result.ok).toBe(true);
    expect(await listPendingRequests(db())).toHaveLength(0);
  });

  test('resend access: the same email is renewed, not added twice, and stays signed in', async () => {
    const first = await addGuest(guestForm(ada));
    if (!first.ok) throw new Error('expected ok');
    const before = await getGuestPass(db(), first.guestId, new Date());
    await setGuestAccessStatus(first.guestId, 'paused');
    const again = await addGuest(
      guestForm({ ...ada, email: 'ADA@example.com' }),
    );
    if (!again.ok) throw new Error('expected ok');

    expect(again).toMatchObject({ renewed: true, guestId: first.guestId });
    expect(await getGuestPass(db(), first.guestId, new Date())).toEqual({
      passwordLookup: before?.passwordLookup,
      active: true,
    });
  });
});

describe('addGuest: email and link', () => {
  test('email is required', async () => {
    const result = await addGuest(guestForm({ ...ada, email: '' }));
    if (result.ok) throw new Error('expected error');
    expect(result.fieldErrors?.email).toEqual(['Enter their email address.']);
  });

  test('the message lists every locked project with its link, the one they asked about first', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    await setProjectLevel('bloom', 'unlocked');
    const result = await addGuest(guestForm({ ...ada, project: 'bloom' }));
    if (!result.ok) throw new Error('expected ok');

    const bloom = result.reply.indexOf('https://example.com/projects/bloom');
    const fintech = result.reply.indexOf(
      'https://example.com/projects/fintech-components',
    );
    expect(bloom).toBeGreaterThan(-1);
    expect(fintech).toBeGreaterThan(bloom);
    expect(result.reply).toContain('a 6-digit code will arrive');
    expect(result.guestId).toMatch(/^[0-9a-f-]{36}$/);
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });
});

describe('sendInvite', () => {
  async function invited() {
    const result = await addGuest(guestForm(ada));
    if (!result.ok) throw new Error('expected ok');
    return result.guestId;
  }

  const message = {
    subject: 'Access to my private projects',
    message:
      'Hi Ada,\n\nCactus Plant\nhttps://example.com/projects/cactus-plant\n\nKiran',
  };

  test('without a verified sender it says so and sends nothing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    process.env.RESEND_API_KEY = 'key';
    delete process.env.ACCESS_REQUEST_FROM;

    expect(await sendInvite(await invited(), message)).toEqual({
      ok: false,
      error:
        'Email to guests isn’t set up yet. Copy the message and send it yourself.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
  });

  test('sends the edited message to the guest’s email, replies come to Kiran', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    process.env.RESEND_API_KEY = 'key';
    process.env.ACCESS_REQUEST_FROM = 'Kiran <hello@example.com>';

    expect(await sendInvite(await invited(), message)).toEqual({
      ok: true,
      sentTo: 'ada@example.com',
    });
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    );
    expect(body).toMatchObject({
      from: 'Kiran <hello@example.com>',
      to: 'ada@example.com',
      reply_to: 'kiranspingle@gmail.com',
      subject: message.subject,
      // The plain text is exactly what Kiran wrote
      text: message.message,
    });
    // The HTML version carries the same words and a button to the first link
    expect(body.html).toContain('Access to my private projects</h1>');
    expect(body.html).toContain('Hi Ada,');
    expect(body.html).toMatch(
      /<a href="https:\/\/example\.com\/projects\/cactus-plant"[^>]*>Open the project<\/a>/,
    );
    expect(body.html.match(/Kiran/g)).toHaveLength(1);
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
    delete process.env.ACCESS_REQUEST_FROM;
  });

  test('a failed send is reported and an empty message is refused', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    );
    process.env.RESEND_API_KEY = 'key';
    process.env.ACCESS_REQUEST_FROM = 'Kiran <hello@example.com>';
    const guestId = await invited();

    expect(await sendInvite(guestId, message)).toEqual({
      ok: false,
      error: 'The email didn’t send. Try again, or copy the message.',
    });
    expect(
      (await sendInvite(guestId, { subject: 'x', message: '  ' })).ok,
    ).toBe(false);
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
    delete process.env.ACCESS_REQUEST_FROM;
  });
});

describe('a failure while writing the message changes nothing', () => {
  test('re-inviting a paused guest leaves them paused when it fails', async () => {
    const first = await addGuest(guestForm(ada));
    if (!first.ok) throw new Error('expected ok');
    await setGuestAccessStatus(first.guestId, 'paused');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    content.fail = true;

    const result = await addGuest(guestForm(ada));
    content.fail = false;

    expect(result.ok).toBe(false);
    expect(await guestAda()).toMatchObject({ status: 'paused' });
  });
});

describe('returning guests', () => {
  async function pausedAda() {
    const first = await addGuest(guestForm(ada));
    if (!first.ok) throw new Error('expected ok');
    await setGuestAccessStatus(first.guestId, 'paused');
    await saveRequest(db(), {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Again please',
      productSlug: 'fintech-components',
    });
    const [request] = await listPendingRequests(db());
    return { ...first, requestId: request!.id };
  }

  test('resumeGuest turns access back on, keeps them signed in and approves the request', async () => {
    const { guestId, requestId } = await pausedAda();
    const data = guestForm({
      expiry: 'never',
      requestId,
      project: 'fintech-components',
    });

    const before = await getGuestPass(db(), guestId, new Date());
    const result = await resumeGuest(guestId, data);
    if (!result.ok) throw new Error('expected ok');

    expect(
      (await getGuestPass(db(), guestId, new Date()))?.passwordLookup,
    ).toBe(before?.passwordLookup);

    expect(await guestAda()).toMatchObject({
      status: 'active',
      expiresAt: null,
    });
    expect(await listPendingRequests(db())).toHaveLength(0);
    expect(result).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    expect(result.reply).toContain('a 6-digit code will arrive');
    expect(result.reply).not.toContain('Password');
  });

  test('resumeGuest changes nothing when the guest has no email or is gone', async () => {
    const { requestId } = await pausedAda();
    const { guestId } = await inviteGuest(db(), {
      name: 'No email',
      expiresAt: null,
    });
    await setGuestAccessStatus(guestId, 'paused');
    const data = guestForm({ expiry: 'never', requestId });

    expect(await resumeGuest(guestId, data)).toEqual({
      ok: false,
      error: 'This guest has no email address. Copy the message instead.',
    });
    expect((await getGuest(db(), guestId))?.status).toBe('paused');

    expect(
      (await resumeGuest('11111111-1111-4111-8111-111111111111', data)).ok,
    ).toBe(false);
    expect(await listPendingRequests(db())).toHaveLength(1);
  });

  test('guestMessage writes the links again without changing anything', async () => {
    const { guestId } = await pausedAda();
    const result = await guestMessage(guestId, 'fintech-components');
    if (!result.ok) throw new Error('expected ok');
    expect(result.reply).toContain(
      'Here are the links to my private projects again:',
    );
    expect((await guestAda())?.status).toBe('paused');
    expect(await listPendingRequests(db())).toHaveLength(1);
  });

  test('a sent message marks the request it answers as done', async () => {
    const { guestId, requestId } = await pausedAda();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 200 })),
    );
    process.env.RESEND_API_KEY = 'key';
    process.env.ACCESS_REQUEST_FROM = 'Kiran <hello@example.com>';

    expect(
      (await sendInvite(guestId, { subject: 's', message: 'm' }, requestId)).ok,
    ).toBe(true);
    expect(await listPendingRequests(db())).toHaveLength(0);
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
    delete process.env.ACCESS_REQUEST_FROM;
  });
});

describe('setProjectLevel', () => {
  test('any project can get a password, with or without a demo', async () => {
    expect(await setProjectLevel('bloom', 'unlocked')).toEqual({ ok: true });
    expect((await getStoredLevels(db())).get('bloom')).toBe('unlocked');
  });

  test('saves the level and refreshes the levels cache and pages', async () => {
    const result = await setProjectLevel('fintech-components', 'admin');
    expect(result).toEqual({ ok: true });
    expect((await getStoredLevels(db())).get('fintech-components')).toBe(
      'admin',
    );
    expect(cache.updateTag).toHaveBeenCalledWith(LEVELS_TAG);
    for (const path of [
      '/',
      '/projects',
      '/projects/fintech-components',
      '/showcase',
    ]) {
      expect(cache.revalidatePath).toHaveBeenCalledWith(path);
    }
  });

  test('rejects an unknown level', async () => {
    const result = await setProjectLevel(
      'bloom',
      'secret' as unknown as 'public',
    );
    expect(result.ok).toBe(false);
  });
});

describe('guests', () => {
  async function addAda() {
    const result = await addGuest(guestForm(ada));
    if (!result.ok) throw new Error('expected ok');
    return (await guestAda())!;
  }

  test('pause and resume', async () => {
    const guest = await addAda();
    expect(await setGuestAccessStatus(guest.guestId, 'paused')).toEqual({
      ok: true,
    });
    expect((await guestAda())?.status).toBe('paused');
    expect(await setGuestAccessStatus(guest.guestId, 'active')).toEqual({
      ok: true,
    });
    expect((await guestAda())?.status).toBe('active');
  });

  test('changeGuestExpiry to never clears it; a past custom time is a field error', async () => {
    const guest = await addAda();
    expect(await changeGuestExpiry(guest.guestId, 'never')).toEqual({
      ok: true,
    });
    expect((await guestAda())?.expiresAt).toBeNull();

    expect(
      await changeGuestExpiry(guest.guestId, 'custom', '2020-01-01T09:00'),
    ).toEqual({
      ok: false,
      fieldErrors: { expiryCustom: ['Pick a time in the future.'] },
    });
  });

  test('signOutEverywhere replaces the pass key, so every signed-in device is locked out', async () => {
    const guest = await addAda();
    const before = await getGuestPass(db(), guest.guestId, new Date());

    expect(await signOutEverywhere(guest.guestId)).toEqual({ ok: true });

    const after = await getGuestPass(db(), guest.guestId, new Date());
    expect(after?.active).toBe(true);
    expect(after?.passwordLookup).not.toBe(before?.passwordLookup);
    expect(await signOutEverywhere('not-an-id')).toMatchObject({ ok: false });
  });

  test('updateGuest needs a non-blank name', async () => {
    const guest = await addAda();
    const blank = await updateGuest(guest.guestId, { name: ' ', note: '' });
    expect(blank.ok).toBe(false);

    expect(
      await updateGuest(guest.guestId, { name: 'Ada L.', note: 'VIP' }),
    ).toEqual({ ok: true });
    expect(await guestAda()).toMatchObject({ name: 'Ada L.', note: 'VIP' });
  });

  test('deleteGuest removes the guest', async () => {
    const guest = await addAda();
    expect(await deleteGuest(guest.guestId)).toEqual({ ok: true });
    expect(await guestAda()).toBeUndefined();
  });

  test('invalid ids are rejected', async () => {
    expect((await setGuestAccessStatus('not-a-uuid', 'paused')).ok).toBe(false);
    expect((await declineRequest('not-a-uuid')).ok).toBe(false);
  });

  test('declineRequest takes it out of the inbox', async () => {
    await saveRequest(db(), {
      name: 'Bo',
      email: 'bo@example.com',
      message: '',
      productSlug: 'fintech-components',
    });
    const [request] = await listPendingRequests(db());
    expect(await declineRequest(request!.id)).toEqual({ ok: true });
    expect(await listPendingRequests(db())).toHaveLength(0);
  });
});
