// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import SectionTitle from './section-title';

afterEach(cleanup);

describe('SectionTitle', () => {
  it('renders a level-2 heading in the handwriting font', () => {
    render(<SectionTitle className="mt-4">Writing</SectionTitle>);

    const heading = screen.getByRole('heading', { level: 2, name: 'Writing' });
    expect(heading.className).toContain('font-hand');
    expect(heading.className).toContain('mt-4');
  });
});
