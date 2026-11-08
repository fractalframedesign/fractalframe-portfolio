import { describe, expect, it } from 'vitest';

import { HIGHLIGHT_PROJECT_SLUGS } from './constants';
import { getProjectsBySlugs } from './projects';

describe('getProjectsBySlugs', () => {
  it('returns projects in the order asked', async () => {
    const projects = await getProjectsBySlugs(HIGHLIGHT_PROJECT_SLUGS);

    expect(projects.map((project) => project.name)).toEqual([
      'Fintech Components',
      'Finance Dashboard',
      'Smart Home Dashboard',
    ]);
  });

  it('skips a slug that does not exist', async () => {
    const projects = await getProjectsBySlugs([
      'fintech-components',
      'no-such-project',
    ]);

    expect(projects).toHaveLength(1);
  });

  it('puts Rakuten Link in the first project slot', async () => {
    const [link] = await getProjectsBySlugs(['rakuten-link']);

    expect(link.id).toBe('1');
    // The card opens the story page; View live opens the full demo
    expect(link.href).toBe('/projects/rakuten-link');
    expect(link.liveUrl).toBe('/showcase/rakuten-link');
  });

  it('uses clear placeholders for the template-derived projects', async () => {
    // Project 01 is now Rakuten Link, so the placeholders start at 02
    const slugs = [
      'justos',
      'happy-stats',
      'cactus-plant',
      'stellar',
      'neobase',
      'charter',
      'echo',
      'plasma',
      'scalar',
      'sonic',
      'streamline',
      'relative',
      'bloom',
    ];
    const projects = await getProjectsBySlugs(slugs);

    expect(projects.map((project) => project.name)).toEqual(
      slugs.map((_, index) => `Project ${String(index + 2).padStart(2, '0')}`),
    );
    expect(
      projects.every(
        (project) =>
          project.category === 'upcoming' &&
          project.imagePlaceholder &&
          project.image === '' &&
          project.stack.length === 0 &&
          project.highlights.length === 0 &&
          project.liveUrl === undefined &&
          project.sourceUrl === undefined &&
          project.images.length === 1 &&
          project.images[0].placeholder,
      ),
    ).toBe(true);
  });
});
