// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

import Hero from './hero';

afterEach(cleanup);

// The site layout provides this; the profile icons' tooltips need it
const renderHero = () =>
  render(
    <TooltipProvider>
      <Hero />
    </TooltipProvider>,
  );

describe('Hero', () => {
  it('shows the name row', () => {
    renderHero();

    const photo = screen.getByRole('img', { name: 'Kiran Pingle' });
    expect(photo.getAttribute('src')).toContain('Kiran-Pingle.png');
    expect(screen.getByText('Product Designer')).toBeTruthy();
  });

  it('shows the three intro paragraphs', () => {
    renderHero();

    expect(
      screen.getByText(/good products need all four to agree/),
    ).toBeTruthy();
    expect(screen.getByText(/as my north star/)).toBeTruthy();
    expect(screen.getByText(/I write about what I learn on/)).toBeTruthy();
  });

  it('links to articles and projects in the last paragraph', () => {
    renderHero();

    expect(
      screen.getByRole('link', { name: 'Articles' }).getAttribute('href'),
    ).toBe('/articles');
    expect(
      screen.getByRole('link', { name: 'Projects' }).getAttribute('href'),
    ).toBe('/projects');
  });

  it('links the principles to the About page section', () => {
    renderHero();

    expect(
      screen
        .getByRole('link', { name: '5 guiding principles' })
        .getAttribute('href'),
    ).toBe('/about#principles');
  });

  it('links to LinkedIn, Medium and Dribbble in new tabs', () => {
    renderHero();

    for (const name of ['LinkedIn', 'Medium', 'Dribbble']) {
      const link = screen.getByRole('link', { name });
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.querySelector('svg')).toBeTruthy();
    }
  });

  it('has no buttons, and the name is the only h1', () => {
    renderHero();

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Kiran Pingle');
  });
});
