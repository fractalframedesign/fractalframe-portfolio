// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import AccessSwitch from './access-switch';

beforeAll(() => {
  // Radix Select relies on browser APIs that jsdom does not implement
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(cleanup);

const project = {
  slug: 'fintech-components',
  name: 'Fintech components',
  hasDemo: true,
};

function trigger() {
  return screen.getByRole('combobox', {
    name: 'Access for Fintech components',
  });
}

async function choose(option: string) {
  const user = userEvent.setup();
  await user.click(trigger());
  await user.click(await screen.findByRole('option', { name: option }));
  return user;
}

describe('AccessSwitch: making a project public', () => {
  it('cancel keeps the project protected', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<AccessSwitch {...project} level="unlocked" onSave={onSave} />);

    const user = await choose('Public');
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.textContent).toContain('Make Fintech components public?');
    expect(dialog.textContent).toContain(
      'Anyone will be able to open it. People you invited keep their passwords for later.',
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onSave).not.toHaveBeenCalled();
    expect(trigger().textContent).toBe('Password protected');
  });

  it('confirm makes it public and shows Saved', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<AccessSwitch {...project} level="unlocked" onSave={onSave} />);

    const user = await choose('Public');
    await user.click(await screen.findByRole('button', { name: 'Make public' }));

    expect((await screen.findByRole('status')).textContent).toBe('Saved');
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('fintech-components', 'public');
    expect(trigger().textContent).toBe('Public');
  });

  it('failed save reverts and shows the error', async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ ok: false, error: 'Couldn’t save. Try again.' });
    render(<AccessSwitch {...project} level="unlocked" onSave={onSave} />);

    const user = await choose('Public');
    await user.click(await screen.findByRole('button', { name: 'Make public' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Couldn’t save. Try again.',
    );
    expect(trigger().textContent).toBe('Password protected');
    expect(screen.queryByText('Saved')).toBeNull();
  });

});

describe('AccessSwitch: other changes', () => {
  it('public to protected saves without asking', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<AccessSwitch {...project} level="public" onSave={onSave} />);

    await choose('Password protected');

    expect((await screen.findByRole('status')).textContent).toBe('Saved');
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onSave).toHaveBeenCalledWith('fintech-components', 'unlocked');
    expect(trigger().textContent).toBe('Password protected');
  });

  it('waits for the server before showing the new value', async () => {
    let resolve: (value: { ok: true }) => void = () => {};
    const onSave = vi.fn(
      () => new Promise<{ ok: true }>((done) => (resolve = done)),
    );
    render(<AccessSwitch {...project} level="public" onSave={onSave} />);

    await choose('Password protected');

    await waitFor(() => expect(trigger().textContent).toBe('Saving…'));
    expect(trigger().hasAttribute('disabled')).toBe(true);

    resolve({ ok: true });
    expect((await screen.findByRole('status')).textContent).toBe('Saved');
    expect(trigger().textContent).toBe('Password protected');
  });

  it('offers Hidden only for a project that is hidden now', async () => {
    render(
      <AccessSwitch
        slug="justos"
        name="JustOS"
        level="admin"
        hasDemo={false}
        onSave={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('combobox', { name: 'Access for JustOS' }),
    );

    const options = (await screen.findAllByRole('option')).map(
      (option) => option.textContent,
    );
    expect(options).toEqual(['Public', 'Hidden']);
  });
});
