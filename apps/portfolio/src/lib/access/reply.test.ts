import { describe, expect, test } from 'vitest';

import { copyReplyText } from './reply';

describe('copyReplyText', () => {
  test('with an end date', () => {
    expect(
      copyReplyText({
        name: 'Jane Doe',
        password: 'amber-river-42',
        expiresAt: new Date('2026-11-02T09:00:00Z'),
      }),
    ).toMatchInlineSnapshot(`
      "Hi Jane,

      Thanks for your interest. Here's your password for my private projects:

      amber-river-42

      It works until Nov 2, 2026, 18:00 JST.
      It opens every password-protected case study and demo on my site. Enter it on any of them and you're in. It's asked again after you close your browser.

      Kiran"
    `);
  });

  test('without an end date', () => {
    const reply = copyReplyText({
      name: 'Sam',
      password: 'amber-river-42',
      expiresAt: null,
    });
    expect(reply).toContain('Hi Sam,');
    expect(reply).toContain('amber-river-42');
    expect(reply).not.toContain('It works until');
  });
});
