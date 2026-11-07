// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DesignMotivation } from './design-motivation';

afterEach(cleanup);

describe('DesignMotivation', () => {
  it('lists the five levels as a plain list, starting from the base', () => {
    render(<DesignMotivation />);

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual([
      'Minimal & functional',
      'Reliable & stable',
      'User-friendly',
      'Polished',
      'New',
    ]);
    expect(screen.getByText('01')).toBeTruthy();
    expect(screen.getByText('05')).toBeTruthy();
  });

  it('has no pyramid group labels', () => {
    render(<DesignMotivation />);

    expect(screen.queryByText('Survival')).toBeNull();
    expect(screen.queryByText('Psychological')).toBeNull();
    expect(screen.queryByText('Self-fulfillment')).toBeNull();
  });
});
