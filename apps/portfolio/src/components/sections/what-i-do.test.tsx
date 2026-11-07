// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { WhatIDo } from './what-i-do';

afterEach(cleanup);

// motion's whileInView needs IntersectionObserver, which jsdom lacks
beforeAll(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

describe('WhatIDo', () => {
  it('shows the title and intro line', () => {
    render(<WhatIDo />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'What I do' }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Design, systems, and code for products where clarity is non-negotiable.',
      ),
    ).toBeTruthy();
  });

  it('shows four tiles in order', () => {
    render(<WhatIDo />);

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual([
      'Product design',
      'Design systems',
      'Design leadership',
      'Frontend engineering',
    ]);
  });

  it('each tile has its one sentence', () => {
    render(<WhatIDo />);

    expect(
      screen.getByText(
        'From research and flows to an interface people get at first glance.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Tokens and components that let design and engineering scale together.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Teams and partners aligned, so strong work ships consistently.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'I build what I design, so the details survive to production.',
      ),
    ).toBeTruthy();
  });

  it('has no tags', () => {
    render(<WhatIDo />);

    expect(screen.queryByText('Figma')).toBeNull();
    expect(screen.queryByText('TypeScript')).toBeNull();
  });
});
