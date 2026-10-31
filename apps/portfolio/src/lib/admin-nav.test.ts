import { describe, expect, it } from 'vitest';

import { ADMIN_NAV, isActiveNav } from './admin-nav';

const items = ADMIN_NAV.flatMap((group) => group.items);

describe('isActiveNav', () => {
  it('matches the overview only on /admin exactly', () => {
    expect(isActiveNav('/admin', '/admin')).toBe(true);
    expect(isActiveNav('/admin/guests', '/admin')).toBe(false);
  });

  it('matches other sections by prefix', () => {
    expect(
      isActiveNav('/admin/guests?x=1'.split('?')[0], '/admin/guests'),
    ).toBe(true);
    expect(isActiveNav('/admin/guests/abc', '/admin/guests')).toBe(true);
  });

  it('does not match a section that only shares a prefix string', () => {
    expect(isActiveNav('/admin/guestsbook', '/admin/guests')).toBe(false);
  });
});

describe('ADMIN_NAV', () => {
  it('marks Analytics and Products as coming soon', () => {
    for (const title of ['Analytics', 'Products']) {
      expect(items.find((item) => item.title === title)?.soon).toBe(true);
    }
  });

  it('has a unique href for every live item', () => {
    const hrefs = items.filter((item) => !item.soon).map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
