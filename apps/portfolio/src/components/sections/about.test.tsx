// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import About from './about';

afterEach(cleanup);

describe('About', () => {
  it('shows Design to motivate right after Principles', () => {
    render(<About />);

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent);
    const principles = headings.indexOf('Principles');

    expect(principles).toBeGreaterThan(-1);
    expect(headings[principles + 1]).toBe('Design to motivate');
  });
});
