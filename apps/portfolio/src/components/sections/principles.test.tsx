// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Principles } from './principles';

afterEach(cleanup);

const title = () =>
  screen.getByRole('heading', { level: 2, name: 'Principles' });

describe('Principles', () => {
  it('uses the handwritten title on the home page', () => {
    render(<Principles handwritten />);

    expect(title().className).toContain('font-hand');
  });

  it('keeps the plain title elsewhere', () => {
    render(<Principles />);

    expect(title().className).not.toContain('font-hand');
  });
});
