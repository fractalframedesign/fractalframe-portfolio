import { beforeEach, describe, expect, test, vi } from 'vitest';

import { searchGuestsAction } from './search-actions';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  searchGuests: vi.fn(),
}));

vi.mock('@/lib/access/require-admin', () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock('@/lib/access/admin-queries', () => ({
  searchGuests: mocks.searchGuests,
}));
vi.mock('@/lib/db/client', () => ({ getDb: () => ({}) }));

describe('searchGuestsAction', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('redirects without an admin session and never queries', async () => {
    mocks.requireAdmin.mockRejectedValue(new Error('NEXT_REDIRECT'));
    await expect(searchGuestsAction('anna')).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.searchGuests).not.toHaveBeenCalled();
  });

  test('returns [] for a one-character query', async () => {
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.searchGuests.mockResolvedValue([]);
    expect(await searchGuestsAction('a')).toEqual([]);
  });

  test('returns matches from the query', async () => {
    mocks.requireAdmin.mockResolvedValue(undefined);
    const rows = [{ guestId: 'g1', name: 'Anna', email: null }];
    mocks.searchGuests.mockResolvedValue(rows);
    expect(await searchGuestsAction('an')).toEqual(rows);
  });

  test('returns [] and logs when the query fails', async () => {
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.searchGuests.mockRejectedValue(new Error('db down'));
    expect(await searchGuestsAction('anna')).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  test('returns [] for an over-long query without querying', async () => {
    mocks.requireAdmin.mockResolvedValue(undefined);
    expect(await searchGuestsAction('x'.repeat(101))).toEqual([]);
    expect(mocks.searchGuests).not.toHaveBeenCalled();
  });
});
