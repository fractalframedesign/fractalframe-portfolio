// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import RakutenLinkStory from './rakuten-link-story';

afterEach(cleanup);

const props = {
  role: 'I designed it from the first ideas to launch.',
  highlights: ['One component system for phone and desktop'],
};

describe('RakutenLinkStory', () => {
  it('reads What I did, the iterations, Try it, screens, then the design system', () => {
    const { container } = render(<RakutenLinkStory {...props} />);

    // Section headings only; the demos have headings of their own
    expect(
      [...container.querySelectorAll('h2[id]')].map((h) => h.textContent),
    ).toEqual([
      'What I did',
      'Endless iterations',
      'Try it',
      'Screens',
      'Design system',
    ]);
  });

  it('tells your role and highlights', () => {
    render(<RakutenLinkStory {...props} />);

    expect(screen.getByText(props.role)).toBeTruthy();
    expect(screen.getByText(props.highlights[0])).toBeTruthy();
  });

  it('embeds the working phone and desktop demos', async () => {
    render(<RakutenLinkStory {...props} />);

    const tryIt = screen.getByRole('region', { name: 'Try it' });
    // The phone opens on the logo screen, then shows its tabs
    expect(
      await within(tryIt).findByRole(
        'tablist',
        { name: 'Rakuten Link' },
        { timeout: 2500 },
      ),
    ).toBeTruthy();
    expect(
      within(tryIt).getByRole('navigation', { name: 'Sections' }),
    ).toBeTruthy();
  });

  it('shows the foundation colours with their hex values', () => {
    render(<RakutenLinkStory {...props} />);

    const system = screen.getByRole('region', { name: 'Design system' });
    for (const hex of ['#FF008C', '#000033', '#3B3BA3']) {
      expect(within(system).getByText(hex)).toBeTruthy();
    }
  });

  it('shows the phone screens in their own section', () => {
    render(<RakutenLinkStory {...props} />);

    const screens = screen.getByRole('region', { name: 'Screens' });
    for (const name of ['Chat thread', 'Call screen', 'Keypad', 'Conversation list']) {
      expect(within(screens).getByRole('heading', { level: 3, name })).toBeTruthy();
    }
  });

  it('shows the design system parts in their own section', () => {
    render(<RakutenLinkStory {...props} />);

    const system = screen.getByRole('region', { name: 'Design system' });
    for (const name of ['Colours', 'Type', 'Icons', 'Avatar and Link badge', 'Chat states', 'Dialogs']) {
      expect(within(system).getByRole('heading', { level: 3, name })).toBeTruthy();
    }
    expect(within(system).queryByRole('heading', { level: 3, name: 'Keypad' })).toBeNull();
  });
});
