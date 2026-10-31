import { describe, expect, test } from 'vitest';

import { copyReplyText } from './reply';

describe('copyReplyText', () => {
  test('one project with expiry', () => {
    expect(
      copyReplyText({
        name: 'Jane Doe',
        projectNames: ['Fintech Components'],
        password: 'amber-river-42',
        expiresAt: new Date('2026-11-02T09:00:00Z'),
      }),
    ).toMatchInlineSnapshot(`
      "Hi Jane,

      Thanks for your interest. Here's your password for Fintech Components:

      amber-river-42

      It works until Nov 2, 2026, 18:00 JST.
      Open the project, enter the password, and you're in. It's asked again after you close your browser.

      Kiran"
    `);
  });

  test('two projects without expiry', () => {
    expect(
      copyReplyText({
        name: 'Sam',
        projectNames: ['Alpha', 'Beta'],
        password: 'amber-river-42',
        expiresAt: null,
      }),
    ).toMatchInlineSnapshot(`
      "Hi Sam,

      Thanks for your interest. Here's your password for Alpha and Beta:

      amber-river-42

      Open the project, enter the password, and you're in. It's asked again after you close your browser.

      Kiran"
    `);
  });

  test('joins three names', () => {
    expect(
      copyReplyText({
        name: 'A',
        projectNames: ['X', 'Y', 'Z'],
        password: 'p',
        expiresAt: null,
      }),
    ).toContain('for X, Y and Z:');
  });
});
