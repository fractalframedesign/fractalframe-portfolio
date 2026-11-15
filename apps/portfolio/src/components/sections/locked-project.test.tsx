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
  it('shows only the teaser and an email box with Continue', () => {
    render(<LockedProject project={project} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cactus Plant' }),
    ).toBeTruthy();
    expect(screen.getByText('A plant care app.')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Cactus Plant' })).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
    expect(screen.queryByLabelText('Password')).toBeNull();
  });

  it('does not jump focus past the heading to the email box', () => {
    render(<LockedProject project={project} />);
    expect(document.activeElement).not.toBe(screen.getByLabelText('Email'));
  });

  it('sends the visitor back to the case study after signing in', () => {
    const { container } = render(<LockedProject project={project} />);
    const next =
      container.querySelector<HTMLInputElement>('input[name="next"]');
    expect(next?.value).toBe('/projects/cactus-plant');
  });

  it('starts on the code step when the email is known', () => {
    render(<LockedProject project={project} initialEmail="ada@example.com" />);
    expect(screen.getByText(/We sent a 6-digit code to/)).toBeTruthy();
    expect(screen.getByText('ada@example.com')).toBeTruthy();
    expect(screen.getByLabelText('6-digit code')).toBeTruthy();
  });
});
