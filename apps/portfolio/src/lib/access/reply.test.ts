import { describe, expect, test } from 'vitest';

import { copyReplyText } from './reply';

const projects = [
  { name: 'Cactus Plant', link: 'https://example.com/projects/cactus-plant' },
  {
    name: 'Fintech Components',
    link: 'https://example.com/projects/fintech-components',
  },
];

describe('copyReplyText', () => {
  test('lists each project title with its link, then the password', () => {
    expect(
      copyReplyText({
        name: 'Jane Doe',
        password: 'amber-river-42',
        expiresAt: new Date('2026-11-02T09:00:00Z'),
        projects,
      }),
    ).toBe(`Hi Jane,

Kiran invited you to these private projects:

Cactus Plant
https://example.com/projects/cactus-plant

Fintech Components
https://example.com/projects/fintech-components

Password: amber-river-42

It works until Nov 2, 2026, 18:00 JST.
Open a link and enter the password. It's asked again after you close your browser.

Kiran`);
  });

  test('without an end date there is no end-date line', () => {
    const reply = copyReplyText({
      name: 'Sam',
      password: 'amber-river-42',
      expiresAt: null,
      projects: projects.slice(0, 1),
    });
    expect(reply).toContain('Password: amber-river-42');
    expect(reply).not.toContain('It works until');
  });
});
