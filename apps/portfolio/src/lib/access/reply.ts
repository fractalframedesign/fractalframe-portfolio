import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

import { LOCATION } from '@/lib/constants';

function formatExpiry(date: Date) {
  return `${format(new TZDate(date, LOCATION.timeZone), 'MMM d, yyyy, HH:mm')} JST`;
}

/** Reply for Kiran to paste into an email: one password for every locked project */
export function copyReplyText({
  name,
  password,
  expiresAt,
}: {
  name: string;
  password: string;
  expiresAt: Date | null;
}) {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const expiry = expiresAt
    ? `It works until ${formatExpiry(expiresAt)}.\n`
    : '';

  return `Hi ${firstName},

Thanks for your interest. Here's your password for my private projects:

${password}

${expiry}It opens every password-protected case study and demo on my site. Enter it on any of them and you're in. It's asked again after you close your browser.

Kiran`;
}
