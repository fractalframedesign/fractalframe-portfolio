import { expect, test } from 'vitest';

import {
  formatAdminDate,
  grantStatusLabel,
  lastVisitLabel,
} from './admin-format';

const NOW = new Date('2026-11-02T09:00:00Z');

test('formatAdminDate shows Tokyo time', () => {
  expect(formatAdminDate(NOW)).toBe('Nov 2, 18:00');
});

test('lastVisitLabel', () => {
  const ago = (ms: number) => new Date(NOW.getTime() - ms);
  expect(lastVisitLabel(null, NOW)).toBe('Never');
  expect(lastVisitLabel(ago(20_000), NOW)).toBe('Just now');
  expect(lastVisitLabel(ago(12 * 60_000), NOW)).toBe('12 min ago');
  expect(lastVisitLabel(ago(3 * 3_600_000), NOW)).toBe('3 h ago');
  expect(lastVisitLabel(ago(26 * 3_600_000), NOW)).toBe('1 day ago');
  expect(lastVisitLabel(ago(72 * 3_600_000), NOW)).toBe('3 days ago');
});

test('grantStatusLabel: expired beats active and paused', () => {
  const past = new Date(NOW.getTime() - 1);
  const future = new Date(NOW.getTime() + 60_000);
  expect(grantStatusLabel({ status: 'active', expiresAt: past }, NOW)).toBe(
    'Expired',
  );
  expect(grantStatusLabel({ status: 'paused', expiresAt: past }, NOW)).toBe(
    'Expired',
  );
  expect(grantStatusLabel({ status: 'paused', expiresAt: future }, NOW)).toBe(
    'Paused',
  );
  expect(grantStatusLabel({ status: 'active', expiresAt: null }, NOW)).toBe(
    'Active',
  );
});
