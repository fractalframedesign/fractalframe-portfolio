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

  test('resume and reminder messages point to the password they already have', () => {
    const resume = copyReplyText({
      name: 'Sam',
      password: null,
      expiresAt: null,
      projects,
      kind: 'resume',
    });
    expect(resume).toContain('Your access to my private projects is back on:');
    expect(resume).toContain('Password: use the one I sent you before.');
    expect(resume).toContain('https://example.com/projects/cactus-plant');

    const reminder = copyReplyText({
      name: 'Sam',
      password: null,
      expiresAt: null,
      projects,
      kind: 'reminder',
    });
    expect(reminder).toContain(
      'Here are the links to my private projects again:',
    );
  });
});
