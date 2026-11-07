// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Hero from './hero';

afterEach(cleanup);

describe('Hero', () => {
  it('shows the name row', () => {
    render(<Hero />);

    const photo = screen.getByRole('img', { name: 'Kiran Pingle' });
    expect(photo.getAttribute('src')).toContain('Kiran-Pingle.png');
    expect(screen.getByText('Product Designer, Rakuten')).toBeTruthy();
  });

  it('shows the three intro paragraphs', () => {
    render(<Hero />);

    expect(screen.getByText(/good products need all four to agree/)).toBeTruthy();
    expect(
      screen.getByText(/clarity comes from systems, not screens/),
    ).toBeTruthy();
    expect(screen.getByText(/I write about what I learn on/)).toBeTruthy();
  });

  it('links to articles and projects in the last paragraph', () => {
    render(<Hero />);

    expect(
      screen.getByRole('link', { name: 'Articles' }).getAttribute('href'),
    ).toBe('/articles');
    expect(
      screen.getByRole('link', { name: 'Projects' }).getAttribute('href'),
    ).toBe('/projects');
  });

  it('has no buttons, and the name is the only h1', () => {
    render(<Hero />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Kiran Pingle');
  });
});
