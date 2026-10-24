'use server';

import { z } from 'zod';

import { CONTACT_EMAIL } from '@/lib/constants';
import { getShowcaseProject } from '@/lib/showcase';
import { getProtectedSlug } from '@/lib/showcase-access';

export type RequestAccessState = {
  sent?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<RequestField, string[]>>;
  /** Echoed back so a failed send doesn't clear what the person typed */
  values?: Partial<Record<RequestField, string>>;
};

type RequestField = 'name' | 'email' | 'message';

const requestSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100),
  email: z.email('Enter a valid email address.'),
  message: z.string().trim().max(1000, 'Keep it under 1000 characters.'),
});

export async function requestAccess(
  _state: RequestAccessState,
  formData: FormData,
): Promise<RequestAccessState> {
  // Bots fill every field; people never see this one
  if (formData.get('company')) return { sent: true };

  const slug = getProtectedSlug(`/showcase/${formData.get('project')}`);
  const project = slug && getShowcaseProject(slug);
  if (!project) return { error: 'This project doesn’t need a password.' };

  const values = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? '').trim(),
    message: String(formData.get('message') ?? ''),
  };
  const parsed = requestSchema.safeParse(values);
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set, access request not sent');
    return {
      values,
      error: 'Requests aren’t working right now. Please try later.',
    };
  }

  const { name, email, message } = parsed.data;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:
        process.env.ACCESS_REQUEST_FROM ?? 'Showcase <onboarding@resend.dev>',
      to: CONTACT_EMAIL,
      reply_to: email,
      subject: `Access request: ${project.name} from ${name}`,
      text: [
        `${name} <${email}> asked for access to ${project.name}.`,
        message && `Message:\n${message}`,
        'Reply to this email to send them a password.',
      ]
        .filter(Boolean)
        .join('\n\n'),
    }),
  });

  if (!response.ok) {
    console.error('Access request email failed', await response.text());
    return { values, error: 'Your request didn’t send. Please try again.' };
  }

  return { sent: true };
}
