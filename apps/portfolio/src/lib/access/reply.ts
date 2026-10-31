import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

import { LOCATION } from '@/lib/constants';

function formatExpiry(date: Date) {
  return `${format(new TZDate(date, LOCATION.timeZone), 'MMM d, yyyy, HH:mm')} JST`;
}

export const INVITE_SUBJECT = 'Your password for my private projects';

/** Invitation text Kiran can edit, then send or copy: one password for every locked project */
export function copyReplyText({
  name,
  password,
  expiresAt,
  link,
}: {
  name: string;
  password: string;
  expiresAt: Date | null;
  /** Where to start: the page they asked from, or the projects page */
  link: string;
}) {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const expiry = expiresAt
    ? `It works until ${formatExpiry(expiresAt)}.\n`
    : '';

  return `Hi ${firstName},

Thanks for your interest. Here's your password for my private projects:

${password}

Open this link and enter the password:
${link}

${expiry}It opens every password-protected case study and demo on my site. It's asked again after you close your browser.

Kiran`;
}
