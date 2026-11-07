// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Principles } from './principles';

afterEach(cleanup);

const title = () =>
  screen.getByRole('heading', { level: 2, name: 'Principles' });

describe('Principles', () => {
  it('uses sentence case and plain wording', () => {
    render(<Principles />);

    expect(
      screen.getByText(
        'Five principles guide how I approach design engineering.',
      ),
    ).toBeTruthy();
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual([
      'Clarity over complexity',
      'Systems over screens',
      'Collaboration over handoffs',
      'Progress over perfection',
      'People first',
    ]);
  });

  it('uses the handwritten title on the home page', () => {
    render(<Principles handwritten />);

    expect(title().className).toContain('font-hand');
  });

  it('keeps the plain title elsewhere', () => {
    render(<Principles />);

    expect(title().className).not.toContain('font-hand');
  });
});
