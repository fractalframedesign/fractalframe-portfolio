import { expect, test } from 'vitest';

import { emailParam, takeEmail } from './sign-in-params';

test('emailParam keeps a real email and drops anything else', () => {
  expect(emailParam(' Ada@Example.com ')).toBe('Ada@Example.com');
  expect(emailParam('not-an-email')).toBeUndefined();
  expect(emailParam(['a@b.com', 'c@d.com'])).toBeUndefined();
  expect(emailParam(undefined)).toBeUndefined();
  expect(emailParam(`${'a'.repeat(320)}@example.com`)).toBeUndefined();
});

test('takeEmail lifts ?email= out of the return path', () => {
  expect(
    takeEmail('/showcase/fintech-components/docs?email=ada%40example.com'),
  ).toEqual({
    next: '/showcase/fintech-components/docs',
    email: 'ada@example.com',
  });
  expect(takeEmail('/showcase/x?tab=2&email=ada%40example.com#top')).toEqual({
    next: '/showcase/x?tab=2#top',
    email: 'ada@example.com',
  });
});

test('takeEmail leaves other paths as they are', () => {
  expect(takeEmail('/showcase/x?tab=2')).toEqual({ next: '/showcase/x?tab=2' });
  expect(takeEmail('/showcase/x?email=nope')).toEqual({ next: '/showcase/x' });
  expect(takeEmail('//evil.com/?email=a%40b.com')).toEqual({
    next: '//evil.com/?email=a%40b.com',
  });
  expect(takeEmail('')).toEqual({ next: '' });
});
