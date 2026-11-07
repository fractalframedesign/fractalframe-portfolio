// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FlowArt, SwatchArt } from './what-i-do-art';

afterEach(cleanup);

const fill = (el: Element) =>
  [...el.classList].find((name) => name.startsWith('bg-'));

describe('SwatchArt', () => {
  it('shows six different, outlined colours so each stays visible in both themes', () => {
    const { container } = render(<SwatchArt />);
    const swatches = [...container.querySelectorAll('span')];

    expect(swatches).toHaveLength(6);
    expect(new Set(swatches.map(fill)).size).toBe(6);
    // muted and border are the same colour in dark mode
    expect(swatches.map(fill)).not.toContain('bg-muted');
    expect(swatches.map(fill)).not.toContain('bg-border');
    for (const swatch of swatches) {
      expect(swatch.classList.contains('ring-1')).toBe(true);
    }
  });
});

describe('FlowArt', () => {
  it('draws the inactive screens’ bar in a colour visible on a white page', () => {
    const { container } = render(<FlowArt />);
    const fills = [...container.querySelectorAll('span')].map(fill);

    expect(fills).not.toContain('bg-muted');
  });
});
