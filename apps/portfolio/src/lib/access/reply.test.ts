import { describe, expect, test } from 'vitest';

import { copyReplyText, INVITE_SUBJECT } from './reply';

const projects = [
  { name: 'Cactus Plant', link: 'https://example.com/projects/cactus-plant' },
  {
    name: 'Fintech Components',
    link: 'https://example.com/projects/fintech-components',
  },
];

describe('copyReplyText', () => {
  test('lists each project title with its link, then how to sign in', () => {
    expect(
      copyReplyText({
        name: 'Jane Doe',
        expiresAt: new Date('2026-11-02T09:00:00Z'),
        projects,
      }),
    ).toBe(`Hi Jane,

You now have access to my private projects:

Cactus Plant
https://example.com/projects/cactus-plant

Fintech Components
https://example.com/projects/fintech-components

To open one, enter your email on the page and a 6-digit code will arrive.
You stay signed in on that device until I end your access.

It works until Nov 2, 2026, 18:00 JST.

Kiran`);
  });

  test('without an end date there is no end-date line', () => {
    const reply = copyReplyText({
      name: 'Sam',
      expiresAt: null,
      projects: projects.slice(0, 1),
    });
    expect(reply).not.toContain('It works until');
    expect(reply).toContain('until I end your access.\n\nKiran');
  });

  test('resume and reminder messages keep their first lines and never mention a password', () => {
    const resume = copyReplyText({
      name: 'Sam',
      expiresAt: null,
      projects,
      kind: 'resume',
    });
    expect(resume).toContain('Your access to my private projects is back on:');
    expect(resume).toContain('a 6-digit code will arrive');
    expect(resume).not.toContain('Password');
    expect(resume).toContain('https://example.com/projects/cactus-plant');

    const reminder = copyReplyText({
      name: 'Sam',
      expiresAt: null,
      projects,
      kind: 'reminder',
    });
    expect(reminder).toContain(
      'Here are the links to my private projects again:',
    );
    expect(reminder).not.toContain('Password');
  });

  test('the default subject no longer promises a password', () => {
    expect(INVITE_SUBJECT).toBe('Access to my private projects');
  });
});
