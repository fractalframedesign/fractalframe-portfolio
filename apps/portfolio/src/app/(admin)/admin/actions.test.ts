import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createAdminSession } from '@/lib/access/admin-session';
import { LEVELS_TAG } from '@/lib/access/cached-levels';
import { listGrantsByProduct, listGuests } from '@/lib/access/repo/guests';
import { getStoredLevels, seedProducts } from '@/lib/access/repo/products';
import { listPendingRequests, saveRequest } from '@/lib/access/repo/requests';
import type { Db } from '@/lib/db/client';
import { createTestDb } from '@/lib/db/test-db';

import {
  addGuest,
  changeExpiry,
  declineRequest,
  deleteGuest,
  newPassword,
  removeGrant,
  setGrantStatus,
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
  products: 'fintech-components',
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

    expect(await listGuests(db())).toHaveLength(0);
    expect((await getStoredLevels(db())).get('fintech-components')).toBe(
      'unlocked',
    );
    expect(cache.updateTag).not.toHaveBeenCalled();
  });
});

describe('addGuest', () => {
  test('creates the guest and returns the password and a reply', async () => {
    const result = await addGuest(guestForm(ada));
    if (!result.ok) throw new Error('expected ok');

    expect(result.password).toMatch(/\S+/);
    expect(result.rotated).toBe(false);
    expect(result.reply).toContain('Hi Ada,');
    expect(result.reply).toContain(result.password);

    const grants = await listGrantsByProduct(db(), 'fintech-components');
    expect(grants).toHaveLength(1);
    expect(grants[0]!.name).toBe('Ada Lovelace');
    expect(grants[0]!.expiresAt).not.toBeNull();
  });

  test('a custom expiry in the past is a field error', async () => {
    const result = await addGuest(
      guestForm({ ...ada, expiry: 'custom', expiryCustom: '2020-01-01T09:00' }),
    );
    expect(result).toEqual({
      ok: false,
      fieldErrors: { expiryCustom: ['Pick a time in the future.'] },
    });
    expect(await listGuests(db())).toHaveLength(0);
  });

  test('a blank name is a field error', async () => {
    const result = await addGuest(guestForm({ ...ada, name: '   ' }));
    if (result.ok) throw new Error('expected error');
    expect(result.fieldErrors?.name).toBeDefined();
  });

  test('needs at least one project', async () => {
    const result = await addGuest(guestForm({ ...ada, products: [] }));
    if (result.ok) throw new Error('expected error');
    expect(result.fieldErrors?.products).toBeDefined();
  });

  test('a project that isn’t Unlocked is an error', async () => {
    const result = await addGuest(guestForm({ ...ada, products: 'bloom' }));
    if (result.ok) throw new Error('expected error');
    expect(result.fieldErrors?.products).toBeDefined();
    expect(await listGuests(db())).toHaveLength(0);
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
    expect(await listGrantsByProduct(db(), 'fintech-components')).toHaveLength(
      1,
    );
  });

  test('the same email again replaces the password and says so', async () => {
    await addGuest(guestForm(ada));
    const result = await addGuest(guestForm(ada));
    if (!result.ok) throw new Error('expected ok');
    expect(result.rotated).toBe(true);
  });
});

describe('setProjectLevel', () => {
  test('a project without a demo can’t be Unlocked', async () => {
    const result = await setProjectLevel('bloom', 'unlocked');
    expect(result.ok).toBe(false);
    expect((await getStoredLevels(db())).get('bloom')).toBe('public');
    expect(cache.updateTag).not.toHaveBeenCalled();
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

describe('grants and guests', () => {
  async function addAda() {
    const result = await addGuest(guestForm(ada));
    if (!result.ok) throw new Error('expected ok');
    const [grant] = await listGrantsByProduct(db(), 'fintech-components');
    return grant!;
  }

  test('pause and resume', async () => {
    const grant = await addAda();
    expect(await setGrantStatus(grant.grantId, 'paused')).toEqual({ ok: true });
    expect(
      (await listGrantsByProduct(db(), 'fintech-components'))[0]!.status,
    ).toBe('paused');
    expect(await setGrantStatus(grant.grantId, 'active')).toEqual({ ok: true });
    expect(
      (await listGrantsByProduct(db(), 'fintech-components'))[0]!.status,
    ).toBe('active');
  });

  test('changeExpiry to never clears it; a past custom time is a field error', async () => {
    const grant = await addAda();
    expect(await changeExpiry(grant.grantId, 'never')).toEqual({ ok: true });
    expect(
      (await listGrantsByProduct(db(), 'fintech-components'))[0]!.expiresAt,
    ).toBeNull();

    expect(
      await changeExpiry(grant.grantId, 'custom', '2020-01-01T09:00'),
    ).toEqual({
      ok: false,
      fieldErrors: { expiryCustom: ['Pick a time in the future.'] },
    });
  });

  test('newPassword returns a new password and reply', async () => {
    const grant = await addAda();
    const result = await newPassword(grant.guestId);
    if (!result.ok) throw new Error('expected ok');
    expect(result.reply).toContain(result.password);
    expect(result.reply).toContain('Hi Ada,');
  });

  test('updateGuest needs a non-blank name', async () => {
    const grant = await addAda();
    const blank = await updateGuest(grant.guestId, { name: ' ', note: '' });
    expect(blank.ok).toBe(false);

    expect(
      await updateGuest(grant.guestId, { name: 'Ada L.', note: 'VIP' }),
    ).toEqual({ ok: true });
    const [guest] = await listGuests(db());
    expect(guest).toMatchObject({ name: 'Ada L.', note: 'VIP' });
  });

  test('removeGrant takes the guest off the project', async () => {
    const grant = await addAda();
    expect(await removeGrant(grant.grantId)).toEqual({ ok: true });
    expect(await listGrantsByProduct(db(), 'fintech-components')).toHaveLength(
      0,
    );
  });

  test('deleteGuest removes the guest and their grants', async () => {
    const grant = await addAda();
    expect(await deleteGuest(grant.guestId)).toEqual({ ok: true });
    expect(await listGuests(db())).toHaveLength(0);
  });

  test('invalid ids are rejected', async () => {
    expect((await setGrantStatus('not-a-uuid', 'paused')).ok).toBe(false);
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
