// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import GuestsTable from './guests-table';

const actions = vi.hoisted(() => ({
  deleteGuest: vi.fn(),
  setGuestAccessStatus: vi.fn(),
  signOutEverywhere: vi.fn(),
  changeGuestExpiry: vi.fn(),
  updateGuest: vi.fn(),
}));
vi.mock('@/app/(admin)/admin/actions', () => actions);

beforeAll(() => {
  // Radix menus rely on browser APIs that jsdom does not implement
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const now = new Date('2026-11-14T00:00:00Z');
const ada = {
  guestId: 'g-ada',
  name: 'Ada',
  email: 'ada@x.com',
  note: '',
  status: 'active' as const,
  expiresAt: null,
  lastVisitAt: null,
  visitCount: 0,
  createdAt: now,
};

async function openMenu() {
  const user = userEvent.setup();
  render(<GuestsTable rows={[ada]} filtered={false} now={now} />);
  await user.click(screen.getByRole('button', { name: 'Actions for Ada' }));
  return user;
}

describe('GuestsTable', () => {
  it('offers Sign out of their devices, not a new password', async () => {
    await openMenu();
    const items = (await screen.findAllByRole('menuitem')).map(
      (item) => item.textContent,
    );
    expect(items).toContain('Sign out of their devices');
    expect(items.join(' ')).not.toMatch(/password/i);
  });

  it('asks first, then signs the guest out everywhere', async () => {
    actions.signOutEverywhere.mockResolvedValue({ ok: true });
    const user = await openMenu();
    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Sign out of their devices',
      }),
    );

    const dialog = await screen.findByRole('alertdialog');
    expect(
      within(dialog).getByRole('heading', {
        name: 'Sign Ada out of their devices?',
      }),
    ).toBeTruthy();
    expect(dialog.textContent).toContain(
      'Every device they signed in on is locked out. They can sign in again with a new code.',
    );
    expect(actions.signOutEverywhere).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    expect(actions.signOutEverywhere).toHaveBeenCalledWith('g-ada');
  });

  it('removing a guest no longer talks about a password', async () => {
    const user = await openMenu();
    await user.click(
      await screen.findByRole('menuitem', { name: 'Remove guest' }),
    );
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.textContent).toContain(
      'They lose access straight away and are taken off your guest list. This can’t be undone.',
    );
  });
});
