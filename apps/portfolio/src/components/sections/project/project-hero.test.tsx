// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ProjectHero from './project-hero';

afterEach(cleanup);

describe('ProjectHero', () => {
  it('offers View live but no Source code link', () => {
    render(
      <ProjectHero
        name="Rakuten Link"
        liveUrl="/showcase/rakuten-link"
        coverImage="/images/projects/rakuten-link/cover.png"
        longDescription="Free calls and messages."
        // Projects still carry a sourceUrl in their frontmatter
        {...{ sourceUrl: '/showcase/rakuten-link/docs' }}
      />,
    );

    expect(screen.getByRole('link', { name: 'View live' })).toBeTruthy();
    expect(screen.queryByText('Source code')).toBeNull();
  });

  it('plays a muted, looping cover video with a pause button when one is set', () => {
    const { container } = render(
      <ProjectHero
        name="Rakuten Link"
        coverImage="/images/projects/rakuten-link/cover.png"
        coverVideo={{
          src: '/images/projects/rakuten-link/cover.mp4',
          poster: '/images/projects/rakuten-link/cover-poster.jpg',
        }}
        longDescription="Free calls and messages."
      />,
    );

    const video = container.querySelector('video');
    expect(video?.getAttribute('src')).toBe('/images/projects/rakuten-link/cover.mp4');
    expect(video?.getAttribute('poster')).toBe('/images/projects/rakuten-link/cover-poster.jpg');
    expect(video?.muted).toBe(true);
    expect(video?.loop).toBe(true);
    expect(screen.getByRole('button', { name: 'Pause video' })).toBeTruthy();
    expect(screen.queryByRole('img', { name: 'Rakuten Link' })).toBeNull();
  });
});
