// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ProjectFrontmatter } from '@/lib/types';

import ProjectsList from './projects-list';

afterEach(cleanup);

const project = (
  overrides: Partial<ProjectFrontmatter & { locked: boolean }>,
) =>
  ({
    slug: 'charter',
    name: 'Charter',
    description: 'Legal services made accessible',
    href: 'https://example.com',
    image: '/images/projects/charter.webp',
    category: 'personal',
    ...overrides,
  }) as ProjectFrontmatter & { locked?: boolean };

describe('ProjectsList', () => {
  it('shows each project as one big card with its name and description', () => {
    render(<ProjectsList projects={[project({})]} />);

    const card = screen.getByRole('link', { name: /Charter/ });
    expect(card.getAttribute('href')).toBe('/projects/charter');
    expect(within(card).queryByText('Personal Project')).toBeNull();
    expect(
      within(card).getByText('Legal services made accessible'),
    ).toBeTruthy();
    expect(within(card).getByText(/View project/)).toBeTruthy();
    expect(card.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('link', { name: /Charter.*Charter/ })).toBeNull();
  });

  it('links showcase projects straight to their page, in a new tab when set', () => {
    render(
      <ProjectsList
        projects={[
          project({
            slug: 'fintech-components',
            name: 'Fintech Components',
            href: '/showcase/fintech-components',
            category: 'upcoming',
            openInNewTab: true,
          }),
        ]}
      />,
    );

    const card = screen.getByRole('link', { name: /Fintech Components/ });
    expect(card.getAttribute('href')).toBe('/showcase/fintech-components');
    expect(card.getAttribute('target')).toBe('_blank');
  });

  it('marks password-protected projects with a lock', () => {
    render(<ProjectsList projects={[project({ locked: true })]} />);

    expect(
      screen.getByRole('img', { name: 'Password protected' }),
    ).toBeTruthy();
  });

  it('puts View project on the same line as the name', () => {
    render(<ProjectsList projects={[project({})]} />);

    const name = screen.getByRole('heading', { level: 2, name: 'Charter' });
    expect(name.parentElement?.textContent).toContain('View project');
  });

  it('has no filter tabs', () => {
    render(<ProjectsList projects={[project({})]} />);

    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });
});
