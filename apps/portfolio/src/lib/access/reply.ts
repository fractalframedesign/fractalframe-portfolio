import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

import { LOCATION } from '@/lib/constants';

function formatExpiry(date: Date) {
  return `${format(new TZDate(date, LOCATION.timeZone), 'MMM d, yyyy, HH:mm')} JST`;
}

export const INVITE_SUBJECT = 'Access to my private projects';

export type InviteProject = { name: string; link: string };

const INTROS = {
  invite: 'You now have access to my private projects:',
  resume: 'Your access to my private projects is back on:',
  reminder: 'Here are the links to my private projects again:',
};

/** Invitation text Kiran can edit, then send or copy: one email for every locked project */
export function copyReplyText({
  name,
  expiresAt,
  projects,
  kind = 'invite',
}: {
  name: string;
  expiresAt: Date | null;
  /** Every locked project, the one they asked about first */
  projects: InviteProject[];
  kind?: keyof typeof INTROS;
}) {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const list = projects
    .map((project) => `${project.name}\n${project.link}`)
    .join('\n\n');
  const expiry = expiresAt
    ? `It works until ${formatExpiry(expiresAt)}.\n\n`
    : '';

  return `Hi ${firstName},

${INTROS[kind]}

${list}

To open one, enter your email on the page and a 6-digit code will arrive.
You stay signed in on that device until I end your access.

${expiry}Kiran`;
}
