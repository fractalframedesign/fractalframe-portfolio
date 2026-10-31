import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

import { LOCATION } from '@/lib/constants';

function formatExpiry(date: Date) {
  return `${format(new TZDate(date, LOCATION.timeZone), 'MMM d, yyyy, HH:mm')} JST`;
}

export const INVITE_SUBJECT = 'Your password for my private projects';

export type InviteProject = { name: string; link: string };

/** Invitation text Kiran can edit, then send or copy: one password for every locked project */
export function copyReplyText({
  name,
  password,
  expiresAt,
  projects,
}: {
  name: string;
  password: string;
  expiresAt: Date | null;
  /** Every locked project, the one they asked about first */
  projects: InviteProject[];
}) {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const list = projects
    .map((project) => `${project.name}\n${project.link}`)
    .join('\n\n');
  const expiry = expiresAt
    ? `It works until ${formatExpiry(expiresAt)}.\n`
    : '';

  return `Hi ${firstName},

Kiran invited you to these private projects:

${list}

Password: ${password}

${expiry}Open a link and enter the password. It's asked again after you close your browser.

Kiran`;
}
