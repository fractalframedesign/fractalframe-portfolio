// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SiteHeader } from './site-header';

afterEach(cleanup);

const menu = () => within(screen.getByRole('list'));

describe('SiteHeader', () => {
  it('shows the role under the name next to the photo', () => {
    render(<SiteHeader activePath="/" themeToggle={null} />);

    const home = screen.getByRole('link', { name: /Kiran Pingle/ });
    expect(home.getAttribute('href')).toBe('/');
    expect(within(home).getByText('Product Designer')).toBeTruthy();
  });

  it('starts the menu with a Home link', () => {
    render(<SiteHeader activePath="/about" themeToggle={null} />);

    const links = menu().getAllByRole('link');
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'Home',
      'Projects',
      'Profile',
      'Articles',
    ]);
    expect(links[0].getAttribute('href')).toBe('/');
  });

  it('marks Home as the current page only on the home page', () => {
    render(<SiteHeader activePath="/" themeToggle={null} />);

    expect(
      menu().getByRole('link', { name: 'Home' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(
      menu()
        .getByRole('link', { name: 'Projects' })
        .getAttribute('aria-current'),
    ).toBeNull();
  });

  it('does not mark Home on other pages', () => {
    render(
      <SiteHeader
        activePath="/projects/fintech-components"
        themeToggle={null}
      />,
    );

    expect(
      menu().getByRole('link', { name: 'Home' }).getAttribute('aria-current'),
    ).toBeNull();
  });
});
