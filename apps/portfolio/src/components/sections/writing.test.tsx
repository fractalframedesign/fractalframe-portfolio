// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ArticleFrontmatter } from '@/lib/types';

import Writing from './writing';

afterEach(cleanup);

const withImage: ArticleFrontmatter = {
  slug: 'first',
  title: 'First article',
  description: 'About the first thing',
  date: '2026-10-10',
  image: '/images/articles/first.png',
};

const withoutImage: ArticleFrontmatter = {
  slug: 'second',
  title: 'Second article',
  description: 'About the second thing',
  date: '2026-09-06',
};

describe('Writing', () => {
  it('links each row to its article', () => {
    render(<Writing articles={[withImage, withoutImage]} />);

    expect(
      screen.getByRole('link', { name: /First article/ }).getAttribute('href'),
    ).toBe('/articles/first');
    expect(
      screen.getByRole('link', { name: /Second article/ }).getAttribute('href'),
    ).toBe('/articles/second');
    expect(screen.getByText('About the second thing')).toBeTruthy();
  });

  it('shows a thumbnail only when the article has an image', () => {
    render(<Writing articles={[withImage, withoutImage]} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('alt')).toBe('First article');
  });

  it('links to all articles', () => {
    render(<Writing articles={[withImage]} />);

    expect(
      screen.getByRole('link', { name: /read all/i }).getAttribute('href'),
    ).toBe('/articles');
  });
});
