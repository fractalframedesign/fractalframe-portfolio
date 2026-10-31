// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ProjectsList from './projects-list';

vi.mock('@/app/(admin)/admin/actions', () => ({
  addGuest: vi.fn(),
  setProjectLevel: vi.fn(),
}));

afterEach(cleanup);

const projects = [
  { slug: 'a', name: 'Alpha', level: 'unlocked' as const },
  { slug: 'b', name: 'Beta', level: 'public' as const },
  { slug: 'c', name: 'Gamma', level: 'public' as const },
];

describe('ProjectsList', () => {
  it('says how many projects the filter shows', async () => {
    render(<ProjectsList projects={projects} />);
    const status = screen.getByText('3 projects');
    expect(status.getAttribute('role')).toBe('status');

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /password protected/i }));
    expect(status.textContent).toBe('1 project');
  });

  it('has one Invite someone button instead of a button per row', () => {
    render(<ProjectsList projects={projects} />);
    expect(
      screen.queryAllByRole('button', { name: 'Copy password' }),
    ).toHaveLength(0);
    expect(
      screen.getAllByRole('button', { name: 'Invite someone' }),
    ).toHaveLength(1);
  });
});
