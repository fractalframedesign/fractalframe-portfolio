import { describe, expect, test } from 'vitest';

import { accessStatus } from './access-status';

describe('accessStatus', () => {
  test('maps the gate result to what the page watcher needs', () => {
    expect(accessStatus({ kind: 'next' })).toBe('public');
    expect(accessStatus({ kind: 'allow' })).toBe('open');
    expect(accessStatus({ kind: 'allow', recordVisit: 'g' })).toBe('open');
    expect(
      accessStatus({ kind: 'unlock', slug: 's', section: 'projects' }),
    ).toBe('locked');
    expect(accessStatus({ kind: 'not-found' })).toBe('locked');
  });
});
