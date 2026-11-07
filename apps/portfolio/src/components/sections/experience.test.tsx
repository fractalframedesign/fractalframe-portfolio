// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Experience from './experience';

afterEach(cleanup);

describe('Experience', () => {
  it('shows the four jobs in order with their periods', () => {
    render(<Experience />);

    const companies = [
      'Rakuten Mobile',
      'Rakuten Inc.',
      'Reliance Jio',
      'Winjit Technologies',
    ].map((name) => screen.getByText(name));
    for (let i = 1; i < companies.length; i++) {
      expect(
        companies[i - 1].compareDocumentPosition(companies[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(screen.getByText('Product Design Director')).toBeTruthy();
    expect(screen.getByText('2022 - Present')).toBeTruthy();
    expect(screen.getByText('2008 - 2015')).toBeTruthy();
  });

  it('has the Professional journey title and no skills list', () => {
    render(<Experience />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Professional journey' }),
    ).toBeTruthy();
    expect(screen.queryByText('Stakeholder Management')).toBeNull();
  });
});
