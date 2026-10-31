// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect } from 'next/navigation';
import { Component, type ComponentProps, type ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import ProjectAccessMenu from './project-access-menu';

beforeAll(() => {
  // Radix menus rely on browser APIs that jsdom does not implement
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(cleanup);

const project = {
  slug: 'fintech-components',
  name: 'Fintech components',
};

function trigger(name = 'Fintech components') {
  return screen.getByRole('button', { name: `Access for ${name}` });
}

/** The actions the menu offers right now */
async function offers(name?: string) {
  const user = userEvent.setup();
  await user.click(trigger(name));
  const items = (await screen.findAllByRole('menuitem')).map(
    (item) => item.textContent,
  );
  await user.keyboard('{Escape}');
  return items;
}

async function choose(option: string, name?: string) {
  const user = userEvent.setup();
  await user.click(trigger(name));
  await user.click(await screen.findByRole('menuitem', { name: option }));
  return user;
}

/** A project left hidden by an older setup, with no demo */
function renderHidden(
  onSave: ComponentProps<typeof ProjectAccessMenu>['onSave'],
) {
  render(
    <ProjectAccessMenu
      slug="justos"
      name="JustOS"
      level="admin"
      onSave={onSave}
    />,
  );
}

async function expectSaved() {
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe('Saved'),
  );
}

describe('ProjectAccessMenu: confirming before going public', () => {
  it('cancel keeps the project protected', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<ProjectAccessMenu {...project} level="unlocked" onSave={onSave} />);

    const user = await choose('Make public');
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.textContent).toContain('Make Fintech components public?');
    expect(dialog.textContent).toContain(
      'Anyone will be able to open it. People you invited keep their passwords for later.',
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onSave).not.toHaveBeenCalled();
    expect(await offers()).toEqual(['Make public']);
  });

  it('escape closes the dialog without saving', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<ProjectAccessMenu {...project} level="unlocked" onSave={onSave} />);

    const user = await choose('Make public');
    await screen.findByRole('alertdialog');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onSave).not.toHaveBeenCalled();
    expect(await offers()).toEqual(['Make public']);
  });

  it('hidden to public also asks first', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    renderHidden(onSave);

    const user = await choose('Make public', 'JustOS');
    expect((await screen.findByRole('alertdialog')).textContent).toContain(
      'Make JustOS public?',
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onSave).not.toHaveBeenCalled();
    expect(await offers('JustOS')).toEqual(['Make public', 'Add password']);
  });
});

describe('ProjectAccessMenu: saving after confirming', () => {
  it('confirm makes it public and shows Saved', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<ProjectAccessMenu {...project} level="unlocked" onSave={onSave} />);

    const user = await choose('Make public');
    await user.click(
      await screen.findByRole('button', { name: 'Make public' }),
    );

    await expectSaved();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('fintech-components', 'public');
    expect(await offers()).toEqual(['Add password']);
  });

  it('a double click on Make public saves once', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<ProjectAccessMenu {...project} level="unlocked" onSave={onSave} />);

    await choose('Make public');
    const button = await screen.findByRole('button', { name: 'Make public' });
    // Both clicks land before React re-renders and closes the dialog
    act(() => {
      button.click();
      button.click();
    });

    await expectSaved();
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('failed save reverts and shows the error', async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ ok: false, error: 'Couldn’t save. Try again.' });
    render(<ProjectAccessMenu {...project} level="unlocked" onSave={onSave} />);

    const user = await choose('Make public');
    await user.click(
      await screen.findByRole('button', { name: 'Make public' }),
    );

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Couldn’t save. Try again.',
    );
    expect(await offers()).toEqual(['Make public']);
    expect(screen.queryByText('Saved')).toBeNull();
  });
});

describe('ProjectAccessMenu: other changes', () => {
  it('Add password saves without asking', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<ProjectAccessMenu {...project} level="public" onSave={onSave} />);

    await choose('Add password');

    await expectSaved();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onSave).toHaveBeenCalledWith('fintech-components', 'unlocked');
    expect(await offers()).toEqual(['Make public']);
  });

  it('waits for the server before showing the new value', async () => {
    let resolve: (value: { ok: true }) => void = () => {};
    const onSave = vi.fn(
      () => new Promise<{ ok: true }>((done) => (resolve = done)),
    );
    render(<ProjectAccessMenu {...project} level="public" onSave={onSave} />);

    await choose('Add password');

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe('Saving…'),
    );
    expect(trigger().hasAttribute('disabled')).toBe(true);

    resolve({ ok: true });
    await expectSaved();
    expect(await offers()).toEqual(['Make public']);
  });

  it('a hidden project can be made public or get a password', async () => {
    renderHidden(vi.fn());
    expect(await offers('JustOS')).toEqual(['Make public', 'Add password']);
  });
});

/** Stands in for Next's RedirectBoundary */
class Boundary extends Component<
  { onError: (error: unknown) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function redirectError() {
  try {
    redirect('/admin/login');
  } catch (error) {
    return error;
  }
}

describe('ProjectAccessMenu: expired session', () => {
  it('passes a redirect on instead of showing a failed save', async () => {
    const thrown = redirectError();
    const onSave = vi.fn().mockRejectedValue(thrown);
    const onError = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Boundary onError={onError}>
        <ProjectAccessMenu {...project} level="public" onSave={onSave} />
      </Boundary>,
    );

    await choose('Add password');

    await waitFor(() => expect(onError).toHaveBeenCalledWith(thrown));
    expect(screen.queryByText('Couldn’t save. Try again.')).toBeNull();
    vi.mocked(console.error).mockRestore();
  });
});
