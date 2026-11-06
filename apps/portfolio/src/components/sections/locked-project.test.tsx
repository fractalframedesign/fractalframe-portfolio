// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LockedProject from './locked-project';

afterEach(cleanup);

const project = {
  slug: 'cactus-plant',
  name: 'Cactus Plant',
  description: 'A plant care app.',
  image: '/images/projects/cactus.webp',
};

describe('LockedProject', () => {
  it('shows only the teaser, a password box and Request access', () => {
    render(<LockedProject project={project} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cactus Plant' }),
    ).toBeTruthy();
    expect(screen.getByText('A plant care app.')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Cactus Plant' })).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /request access/i }),
    ).toBeTruthy();
  });

  it('does not jump focus past the heading to the password box', () => {
    render(<LockedProject project={project} />);
    expect(document.activeElement).not.toBe(screen.getByLabelText('Password'));
  });

  it('sends the visitor back to the case study after unlocking', () => {
    const { container } = render(<LockedProject project={project} />);
    const next =
      container.querySelector<HTMLInputElement>('input[name="next"]');
    expect(next?.value).toBe('/projects/cactus-plant');
  });
});
