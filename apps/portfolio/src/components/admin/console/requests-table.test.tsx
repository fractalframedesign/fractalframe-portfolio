// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import RequestsTable, { type RequestRow } from './requests-table';

const actions = vi.hoisted(() => ({
  addGuest: vi.fn(),
  declineRequest: vi.fn(),
  sendInvite: vi.fn(),
  resumeGuest: vi.fn(),
  guestMessage: vi.fn(),
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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
    existingGuest: { guestId: 'g-ada', expiresAt: null, state: 'paused' },
  },
  { ...base, id: 'r2', name: 'Bo', email: 'bo@x.com', existingGuest: null },
  {
    ...base,
    id: 'r3',
    name: 'Cy',
    email: 'cy@x.com',
    existingGuest: { guestId: 'g-cy', expiresAt: null, state: 'active' },
  },
];

function row(name: string) {
  return screen.getByText(name).closest('tr')!;
}

describe('RequestsTable', () => {
  it('one clear button per situation', () => {
    render(<RequestsTable requests={requests} />);

    const ada = within(row('Ada'));
    expect(ada.getByText('Paused')).toBeTruthy();
    expect(ada.getByRole('button', { name: 'Resume access' })).toBeTruthy();

    const bo = within(row('Bo'));
    expect(bo.getByRole('button', { name: 'Approve' })).toBeTruthy();

    const cy = within(row('Cy'));
    expect(cy.getByText('Has access')).toBeTruthy();
    expect(cy.getByRole('button', { name: 'Send links again' })).toBeTruthy();
  });

  it('Resume access keeps the password: pick an end date, then send the links', async () => {
    actions.resumeGuest.mockResolvedValue({
      ok: true,
      guestId: 'g-ada',
      name: 'Ada',
      email: 'ada@x.com',
      reply: 'Hi Ada, Password: use the one I sent you before.',
    });
    actions.sendInvite.mockResolvedValue({ ok: true, sentTo: 'ada@x.com' });
    render(<RequestsTable requests={requests} />);
    const user = userEvent.setup();
    await user.click(
      within(row('Ada')).getByRole('button', { name: 'Resume access' }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Resume access for Ada' }),
    ).toBeTruthy();
    expect(dialog.textContent).toContain('Their password stays the same.');
    await user.click(
      within(dialog).getByRole('button', { name: 'Resume access' }),
    );

    expect(actions.resumeGuest).toHaveBeenCalledWith(
      'g-ada',
      expect.any(FormData),
    );
    const form = actions.resumeGuest.mock.calls[0]![1] as FormData;
    expect(form.get('requestId')).toBe('r1');
    expect(form.get('project')).toBe('cactus-plant');

    const message = (await within(dialog).findByLabelText(
      'Message',
    )) as HTMLTextAreaElement;
    expect(message.value).toContain('use the one I sent you before');
    await user.click(
      within(dialog).getByRole('button', { name: 'Send invitation' }),
    );
    expect(actions.sendInvite).toHaveBeenCalledWith(
      'g-ada',
      expect.objectContaining({ message: message.value }),
      'r1',
    );
  });

  it('Send links again goes straight to the message', async () => {
    actions.guestMessage.mockResolvedValue({
      ok: true,
      guestId: 'g-cy',
      name: 'Cy',
      email: 'cy@x.com',
      reply: 'Hi Cy, here are the links again',
    });
    render(<RequestsTable requests={requests} />);
    await userEvent
      .setup()
      .click(
        within(row('Cy')).getByRole('button', { name: 'Send links again' }),
      );

    const dialog = await screen.findByRole('dialog');
    expect(
      ((await within(dialog).findByLabelText('Message')) as HTMLTextAreaElement)
        .value,
    ).toBe('Hi Cy, here are the links again');
    expect(actions.guestMessage).toHaveBeenCalledWith('g-cy', 'cactus-plant');
    expect(within(dialog).queryAllByRole('radio')).toHaveLength(0);
  });

  it('Lost their password? switches to making a new one', async () => {
    render(<RequestsTable requests={requests} />);
    const user = userEvent.setup();
    await user.click(
      within(row('Ada')).getByRole('button', { name: 'Resume access' }),
    );
    await user.click(
      await screen.findByRole('button', {
        name: 'Lost their password? Make a new one',
      }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Resend access to Ada' }),
    ).toBeTruthy();
    expect(dialog.textContent).toContain(
      'This makes a new password. Their old one stops working.',
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
      within(dialog).getByRole('button', { name: 'Approve request' }),
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
      within(dialog).getByRole('button', { name: 'Approve request' }),
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
      within(dialog).getByRole('button', { name: 'Approve request' }),
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
