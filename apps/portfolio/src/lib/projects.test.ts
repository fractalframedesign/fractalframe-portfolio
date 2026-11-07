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
});
