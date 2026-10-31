import { describe, expect, test } from 'vitest';

import { copyReplyText } from './reply';

describe('copyReplyText', () => {
  test('with an end date', () => {
    expect(
      copyReplyText({
        name: 'Jane Doe',
        password: 'amber-river-42',
        expiresAt: new Date('2026-11-02T09:00:00Z'),
        link: 'https://example.com/projects/cactus-plant',
      }),
    ).toMatchInlineSnapshot(`
      "Hi Jane,

      Thanks for your interest. Here's your password for my private projects:

      amber-river-42

      Open this link and enter the password:
      https://example.com/projects/cactus-plant

      It works until Nov 2, 2026, 18:00 JST.
      It opens every password-protected case study and demo on my site. It's asked again after you close your browser.

      Kiran"
    `);
  });

  test('without an end date', () => {
    const reply = copyReplyText({
      name: 'Sam',
      password: 'amber-river-42',
      expiresAt: null,
      link: 'https://example.com/projects',
    });
    expect(reply).toContain('Hi Sam,');
    expect(reply).toContain('amber-river-42');
    expect(reply).not.toContain('It works until');
    expect(reply).toContain('https://example.com/projects');
  });
});
