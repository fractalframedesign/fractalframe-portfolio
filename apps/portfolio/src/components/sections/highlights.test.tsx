// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ProjectFrontmatter } from '@/lib/types';

import Highlights from './highlights';

afterEach(cleanup);

const project = (slug: string, name: string) =>
  ({
    slug,
    name,
    description: `Summary of ${slug}`,
    image: `/images/projects/${slug}/cover.png`,
    liveUrl: `/showcase/${slug}`,
  }) as ProjectFrontmatter;

describe('Highlights', () => {
  it('links each card to its showcase in a new tab', () => {
    render(
      <Highlights
        projects={[project('alpha', 'Alpha'), project('beta', 'Beta')]}
      />,
    );

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/showcase/alpha',
      '/showcase/beta',
    ]);
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
    // The name sits under the image, so the image is decorative
    expect(document.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('link', { name: /Alpha.*Alpha/ })).toBeNull();
    expect(screen.getByText('Summary of alpha')).toBeTruthy();
    expect(screen.queryByText(/20\d\d/)).toBeNull();
  });

  it('renders nothing when there are no projects', () => {
    const { container } = render(<Highlights projects={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
