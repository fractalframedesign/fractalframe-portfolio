// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { CONTACTS } from './data';
import { LinkDesktopApp } from './LinkDesktopApp';
import { LinkMobileApp } from './LinkMobileApp';

afterEach(cleanup);

const linkCount = CONTACTS.filter((c) => c.onLink).length;

describe('LinkMobileApp', () => {
  it('opens on Calls and filters contacts to Link users', async () => {
    const user = userEvent.setup();
    render(<LinkMobileApp skipSplash />);

    expect(screen.getByRole('heading', { name: 'Calls' })).toBeTruthy();
    expect(screen.getByText(`Contacts (${CONTACTS.length})`)).toBeTruthy();

    await user.click(screen.getByRole('tab', { name: 'Link' }));
    expect(screen.getByText(`Contacts (${linkCount})`)).toBeTruthy();
  });

  it('calls a contact via Rakuten Link and hangs up', async () => {
    const user = userEvent.setup();
    render(<LinkMobileApp skipSplash />);

    await user.click(screen.getByRole('button', { name: 'Call Aiko Tanaka' }));
    const call = screen.getByRole('dialog', { name: /Aiko Tanaka/ });
    expect(within(call).getByText(/Calling via/)).toBeTruthy();

    await user.click(within(call).getByRole('button', { name: 'Mute' }));
    expect(
      within(call)
        .getByRole('button', { name: 'Mute' })
        .getAttribute('aria-pressed'),
    ).toBe('true');

    await user.click(within(call).getByRole('button', { name: 'End call' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('dials a number on the keypad', async () => {
    const user = userEvent.setup();
    render(<LinkMobileApp skipSplash />);

    await user.click(screen.getByRole('button', { name: 'Open keypad' }));
    for (const key of ['0', '7', '0']) {
      await user.click(screen.getByRole('button', { name: key }));
    }
    expect(screen.getByLabelText('Number').textContent).toBe('070');
  });

  it('sends a message in a Link chat', async () => {
    const user = userEvent.setup();
    render(<LinkMobileApp skipSplash />);

    await user.click(screen.getByRole('tab', { name: /Messages/ }));
    await user.click(screen.getByRole('button', { name: /Aiko Tanaka/ }));
    await user.type(screen.getByLabelText('Message'), 'On my way{Enter}');

    expect(screen.getByText('On my way')).toBeTruthy();
  });

  it('asks to use the phone’s SMS app for contacts not on Link', async () => {
    const user = userEvent.setup();
    render(<LinkMobileApp skipSplash />);

    await user.click(screen.getByRole('tab', { name: /Messages/ }));
    await user.click(screen.getByRole('button', { name: /Chika Mori/ }));

    expect(
      screen.getByText('Please send SMS from your device messaging app'),
    ).toBeTruthy();
    expect(screen.queryByLabelText('Message')).toBeNull();
  });
});

describe('LinkDesktopApp', () => {
  it('shows a conversation beside the list and sends a message', async () => {
    const user = userEvent.setup();
    render(<LinkDesktopApp />);

    await user.click(screen.getByRole('button', { name: /Farah Khan/ }));
    await user.type(screen.getByLabelText('Message'), 'Lunch tomorrow?{Enter}');

    expect(screen.getByText('Lunch tomorrow?')).toBeTruthy();
  });
});
