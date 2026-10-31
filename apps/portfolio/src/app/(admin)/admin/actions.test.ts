import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createAdminSession } from '@/lib/access/admin-session';
import { LEVELS_TAG } from '@/lib/access/cached-levels';
import {
  findGuestByEmail,
  findGuestByPassword,
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
  newPassword,
  setGuestAccessStatus,
  setProjectLevel,
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
  test('creates one guest for every locked project with a password and reply', async () => {
    const result = await addGuest(guestForm(ada));
    if (!result.ok) throw new Error('expected ok');

    expect(result.renewed).toBe(false);
    expect(result.reply).toContain('Hi Ada,');
    expect(result.reply).toContain(result.password);
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

  test('resend access: the same email gets a new password and the old one stops', async () => {
    const first = await addGuest(guestForm(ada));
    if (!first.ok) throw new Error('expected ok');
    const again = await addGuest(
      guestForm({ ...ada, email: 'ADA@example.com' }),
    );
    if (!again.ok) throw new Error('expected ok');

    expect(again.renewed).toBe(true);
    expect(
      await findGuestByPassword(db(), first.password, new Date()),
    ).toBeNull();
    expect(
      await findGuestByPassword(db(), again.password, new Date()),
    ).not.toBeNull();
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

  test('newPassword returns a new password and reply', async () => {
    const guest = await addAda();
    const result = await newPassword(guest.guestId);
    if (!result.ok) throw new Error('expected ok');
    expect(result.reply).toContain(result.password);
    expect(result.reply).toContain('Hi Ada,');
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
