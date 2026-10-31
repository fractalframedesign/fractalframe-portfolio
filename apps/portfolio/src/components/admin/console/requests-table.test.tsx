// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import RequestsTable, { type RequestRow } from './requests-table';

const actions = vi.hoisted(() => ({
  addGuest: vi.fn(),
  declineRequest: vi.fn(),
  sendInvite: vi.fn(),
}));
vi.mock('@/app/(admin)/admin/actions', () => actions);

beforeAll(() => {
  // Radix radio groups measure themselves; jsdom has no ResizeObserver
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(cleanup);

const base = {
  message: '',
  productSlug: 'cactus-plant',
  projectName: 'Cactus Plant',
  receivedLabel: 'Nov 1, 09:00',
};

const requests: RequestRow[] = [
  {
    ...base,
    id: 'r1',
    name: 'Ada',
    email: 'ada@x.com',
    existingGuest: { expiresAt: null },
  },
  { ...base, id: 'r2', name: 'Bo', email: 'bo@x.com', existingGuest: null },
];

function row(name: string) {
  return screen.getByText(name).closest('tr')!;
}

describe('RequestsTable', () => {
  it('marks existing guests and offers Resend access instead of Approve', () => {
    render(<RequestsTable requests={requests} />);

    const ada = within(row('Ada'));
    expect(ada.getByText('Already a guest')).toBeTruthy();
    expect(ada.getByRole('button', { name: 'Resend access' })).toBeTruthy();
    expect(ada.queryByRole('button', { name: 'Approve' })).toBeNull();

    const bo = within(row('Bo'));
    expect(bo.queryByText('Already a guest')).toBeNull();
    expect(bo.getByRole('button', { name: 'Approve' })).toBeTruthy();
  });

  it('Resend access warns that the old password stops, with no project picker', async () => {
    render(<RequestsTable requests={requests} />);
    await userEvent
      .setup()
      .click(within(row('Ada')).getByRole('button', { name: 'Resend access' }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Resend access to Ada' }),
    ).toBeTruthy();
    expect(dialog.textContent).toContain(
      'This makes a new password. Their old one stops working.',
    );
    expect(within(dialog).queryAllByRole('checkbox')).toHaveLength(0);
    expect(within(dialog).getByRole('radio', { name: 'Never' })).toHaveProperty(
      'ariaChecked',
      'true',
    );
  });

  it('Approve opens the invite form prefilled', async () => {
    render(<RequestsTable requests={requests} />);
    await userEvent
      .setup()
      .click(within(row('Bo')).getByRole('button', { name: 'Approve' }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Approve request' }),
    ).toBeTruthy();
    expect(within(dialog).getByLabelText('Name')).toHaveProperty('value', 'Bo');
  });

  it('links a field error to its field', async () => {
    actions.addGuest.mockResolvedValue({
      ok: false,
      fieldErrors: { name: ['Enter a name.'] },
    });
    render(<RequestsTable requests={requests} />);
    const user = userEvent.setup();
    await user.click(
      within(row('Bo')).getByRole('button', { name: 'Approve' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Create invite' }),
    );

    const name = await within(dialog).findByLabelText('Name');
    const describedBy = name.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toBe(
      'Enter a name.',
    );
  });

  it('after creating, shows an editable prefilled message and sends only on Send', async () => {
    actions.addGuest.mockResolvedValue({
      ok: true,
      guestId: 'g1',
      password: 'pw-1',
      renewed: false,
      reply: 'Hi Bo, your password is pw-1 https://example.com/projects',
    });
    actions.sendInvite.mockResolvedValue({ ok: true, sentTo: 'bo@x.com' });
    render(<RequestsTable requests={requests} />);
    const user = userEvent.setup();
    await user.click(
      within(row('Bo')).getByRole('button', { name: 'Approve' }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(
      (within(dialog).getByLabelText('Email') as HTMLInputElement).required,
    ).toBe(true);
    await user.click(
      within(dialog).getByRole('button', { name: 'Create invite' }),
    );

    const message = (await within(dialog).findByLabelText(
      'Message',
    )) as HTMLTextAreaElement;
    expect(message.value).toContain('pw-1');
    expect(within(dialog).getByText('bo@x.com')).toBeTruthy();
    expect(actions.sendInvite).not.toHaveBeenCalled();

    await user.type(message, ' See you!');
    await user.click(
      within(dialog).getByRole('button', { name: 'Send invitation' }),
    );

    expect(actions.sendInvite).toHaveBeenCalledWith('g1', {
      subject: 'Your password for my private projects',
      message:
        'Hi Bo, your password is pw-1 https://example.com/projects See you!',
    });
    expect((await within(dialog).findByRole('status')).textContent).toContain(
      'Sent to bo@x.com',
    );
  });

  it('a send error keeps the message and the copy option', async () => {
    actions.addGuest.mockResolvedValue({
      ok: true,
      guestId: 'g1',
      password: 'pw-1',
      renewed: false,
      reply: 'Hi Bo, pw-1',
    });
    actions.sendInvite.mockResolvedValue({
      ok: false,
      error:
        'Email to guests isn’t set up yet. Copy the message and send it yourself.',
    });
    render(<RequestsTable requests={requests} />);
    const user = userEvent.setup();
    await user.click(
      within(row('Bo')).getByRole('button', { name: 'Approve' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Create invite' }),
    );
    await user.click(
      await within(dialog).findByRole('button', { name: 'Send invitation' }),
    );

    expect((await within(dialog).findByRole('alert')).textContent).toContain(
      'isn’t set up yet',
    );
    expect(
      within(dialog).getByRole('button', { name: /copy message/i }),
    ).toBeTruthy();
  });
});
