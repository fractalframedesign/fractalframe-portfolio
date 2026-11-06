import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

import { LOCATION } from '@/lib/constants';

/** A date in Tokyo time for the admin pages, e.g. "Nov 2, 18:00" */
export function formatAdminDate(date: Date) {
  return format(new TZDate(date, LOCATION.timeZone), 'MMM d, HH:mm');
}

/** "Never", "Just now", "12 min ago", "3 h ago", "2 days ago" */
export function lastVisitLabel(date: Date | null, now: Date) {
  if (!date) return 'Never';
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

/** Expired wins over Paused, so a lapsed grant never looks usable */
export function grantStatusLabel(
  grant: { status: 'active' | 'paused'; expiresAt: Date | null },
  now: Date,
): 'Active' | 'Paused' | 'Expired' {
  if (grant.expiresAt && grant.expiresAt.getTime() <= now.getTime()) {
    return 'Expired';
  }
  return grant.status === 'paused' ? 'Paused' : 'Active';
}
