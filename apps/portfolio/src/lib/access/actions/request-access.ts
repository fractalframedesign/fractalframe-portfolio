'use server';

import { z } from 'zod';

import { offersUnlock } from '@/lib/access/gate';
import { getStoredLevels } from '@/lib/access/repo/products';
import { saveRequest } from '@/lib/access/repo/requests';
import { sendEmail } from '@/lib/access/send-email';
import { CONTACT_EMAIL } from '@/lib/constants';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';

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

  const slug = String(formData.get('project') ?? '');
  const project = (await getAllProjects()).find((item) => item.slug === slug);
  if (!project || !(await offersUnlock(slug, () => getStoredLevels(getDb())))) {
    return { error: 'This project doesn’t need a password.' };
  }

  const values = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? '').trim(),
    message: String(formData.get('message') ?? ''),
  };
  const parsed = requestSchema.safeParse(values);
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // Save first, then email as a best effort: either one keeps the request
  const request = { ...parsed.data, productSlug: slug };
  const saved = await save(request);
  const emailed = await emailKiran({ ...request, projectName: project.name });
  if (!saved && !emailed) {
    return { values, error: 'Your request didn’t send. Please try again.' };
  }

  return { sent: true };
}

type AccessRequest = {
  name: string;
  email: string;
  message: string;
  productSlug: string;
};

async function save(request: AccessRequest) {
  try {
    await saveRequest(getDb(), request);
    return true;
  } catch (error) {
    console.error('Access request was not saved', error);
    return false;
  }
}

function emailKiran({
  name,
  email,
  message,
  projectName,
}: AccessRequest & { projectName: string }) {
  return sendEmail({
    to: CONTACT_EMAIL,
    replyTo: email,
    subject: `Access request: ${projectName} from ${name}`,
    text: [
      `${name} <${email}> asked for access to ${projectName}.`,
      message && `Message:\n${message}`,
      'Open Requests in the admin console to approve them.',
    ]
      .filter(Boolean)
      .join('\n\n'),
  });
}
