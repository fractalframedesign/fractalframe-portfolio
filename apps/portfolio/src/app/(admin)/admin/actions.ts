'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';

import { LEVELS_TAG } from '@/lib/access/cached-levels';
import { expiryChoiceSchema, resolveExpiry } from '@/lib/access/expiry';
import { resolveLevel } from '@/lib/access/levels';
import { copyReplyText, type InviteProject } from '@/lib/access/reply';
import * as accessRepo from '@/lib/access/repo/guest-access';
import * as guestsRepo from '@/lib/access/repo/guests';
import * as productsRepo from '@/lib/access/repo/products';
import * as requestsRepo from '@/lib/access/repo/requests';
import { requireAdmin } from '@/lib/access/require-admin';
import { guestSender, sendEmail } from '@/lib/access/send-email';
import { CONTACT_EMAIL } from '@/lib/constants';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';
import { getSiteUrl } from '@/lib/site';

import { logout as endSession } from './login/actions';

export type ActionError = {
  ok: false;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
export type ActionResult<T extends object = object> =
  ({ ok: true } & T) | ActionError;
export type PasswordResult = ActionResult<{
  guestId: string;
  password: string;
  /** The email was already a guest: their old password stopped working */
  renewed: boolean;
  reply: string;
}>;

const MESSAGES = {
  generic: 'Something went wrong. Try again.',
  invalid: 'That didn’t look right. Reload the page and try again.',
  unknownProject: 'That project doesn’t exist.',
  emailNotSetUp:
    'Email to guests isn’t set up yet. Copy the message and send it yourself.',
  emailFailed: 'The email didn’t send. Try again, or copy the message.',
  noEmail: 'This guest has no email address. Copy the message instead.',
};

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Enter a name.')
  .max(100, 'Keep the name under 100 characters.');
const noteSchema = z
  .string()
  .trim()
  .max(500, 'Keep the note under 500 characters.');
const emailSchema = z
  .string()
  .trim()
  .min(1, { error: 'Enter their email address.', abort: true })
  .max(254, 'Enter a valid email address.')
  .refine(
    (value) => z.email().safeParse(value).success,
    'Enter a valid email address.',
  );
const idSchema = z.uuid();
const slugSchema = z.string().regex(/^[a-z0-9-]{1,100}$/);
const levelSchema = z.enum(['public', 'unlocked', 'admin']);
const expiryCustomSchema = z.string().max(20).optional();

const addGuestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  note: noteSchema,
  expiry: expiryChoiceSchema,
  expiryCustom: expiryCustomSchema,
  requestId: idSchema.optional(),
  /** The page they asked from, for the link in the message */
  project: slugSchema.optional(),
});

const inviteMessageSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

const updateGuestSchema = z.object({ name: nameSchema, note: noteSchema });

function fieldErrors(error: z.ZodError): ActionError {
  return {
    ok: false,
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  };
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function failed(action: string, error: unknown): ActionError {
  console.error(`Admin action ${action} failed`, error);
  return { ok: false, error: MESSAGES.generic };
}

function refreshAdmin() {
  revalidatePath('/admin');
  revalidatePath('/admin/requests');
  revalidatePath('/admin/guests');
}

async function projectNames() {
  const projects = await getAllProjects();
  return new Map(projects.map((project) => [project.slug, project.name]));
}

export async function setProjectLevel(
  slug: string,
  level: 'public' | 'unlocked' | 'admin',
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({ slug: slugSchema, level: levelSchema })
    .safeParse({ slug, level });
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  if (!(await projectNames()).has(parsed.data.slug)) {
    return { ok: false, error: MESSAGES.unknownProject };
  }

  try {
    await productsRepo.setLevel(getDb(), parsed.data.slug, parsed.data.level);
  } catch (error) {
    return failed('setProjectLevel', error);
  }

  updateTag(LEVELS_TAG);
  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/projects/' + parsed.data.slug);
  revalidatePath('/showcase');
  refreshAdmin();
  return { ok: true };
}

function parseAddGuest(formData: FormData) {
  return addGuestSchema.safeParse({
    name: text(formData, 'name'),
    email: text(formData, 'email'),
    note: text(formData, 'note'),
    expiry: text(formData, 'expiry'),
    expiryCustom: text(formData, 'expiryCustom') || undefined,
    requestId: text(formData, 'requestId') || undefined,
    project: text(formData, 'project') || undefined,
  });
}

/**
 * Every password-protected project with its link, the one they asked about
 * first. Falls back to the projects page when nothing is locked.
 */
async function inviteProjects(askedSlug?: string): Promise<InviteProject[]> {
  const site = getSiteUrl();
  const [levels, projects] = await Promise.all([
    productsRepo.getStoredLevels(getDb()),
    getAllProjects(),
  ]);
  const locked = projects
    .filter((project) => resolveLevel(project.slug, levels) === 'unlocked')
    .sort((a, b) => Number(b.slug === askedSlug) - Number(a.slug === askedSlug))
    .map((project) => ({
      name: project.name,
      link: `${site}/projects/${project.slug}`,
    }));
  return locked.length
    ? locked
    : [{ name: 'My projects', link: `${site}/projects` }];
}

export async function addGuest(formData: FormData): Promise<PasswordResult> {
  await requireAdmin();
  const parsed = parseAddGuest(formData);
  if (!parsed.success) return fieldErrors(parsed.error);
  const input = parsed.data;

  const now = new Date();
  const expiry = resolveExpiry(input.expiry, now, input.expiryCustom);
  if (!expiry.ok) {
    return { ok: false, fieldErrors: { expiryCustom: [expiry.error] } };
  }

  try {
    const db = getDb();
    // Everything that can fail comes before the password changes
    const projects = await inviteProjects(input.project);
    const { guestId, password, existing } = await accessRepo.inviteGuest(db, {
      name: input.name,
      email: input.email || undefined,
      note: input.note,
      expiresAt: expiry.expiresAt,
    });
    if (input.requestId) {
      await requestsRepo.approveIfPending(db, input.requestId);
    }

    const reply = copyReplyText({
      name: input.name,
      password,
      expiresAt: expiry.expiresAt,
      projects,
    });
    refreshAdmin();
    return { ok: true, guestId, password, renewed: existing, reply };
  } catch (error) {
    return failed('addGuest', error);
  }
}

/** Kiran sent the message another way (e.g. copied it into Gmail) */
export async function markRequestAnswered(id: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  try {
    await requestsRepo.approveIfPending(getDb(), parsed.data);
  } catch (error) {
    return failed('markRequestAnswered', error);
  }
  refreshAdmin();
  return { ok: true };
}

export async function declineRequest(id: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  try {
    await requestsRepo.setRequestStatus(getDb(), parsed.data, 'declined');
  } catch (error) {
    return failed('declineRequest', error);
  }
  refreshAdmin();
  return { ok: true };
}

export async function setGuestAccessStatus(
  guestId: string,
  status: 'active' | 'paused',
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({ guestId: idSchema, status: z.enum(['active', 'paused']) })
    .safeParse({ guestId, status });
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  try {
    await accessRepo.setGuestStatus(
      getDb(),
      parsed.data.guestId,
      parsed.data.status,
    );
  } catch (error) {
    return failed('setGuestAccessStatus', error);
  }
  refreshAdmin();
  return { ok: true };
}

// craftsman-ignore PARAM001: three parameters, signature fixed by the plan
export async function changeGuestExpiry(
  guestId: string,
  expiry: string,
  expiryCustom?: string,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({
      guestId: idSchema,
      expiry: expiryChoiceSchema,
      expiryCustom: expiryCustomSchema,
    })
    .safeParse({ guestId, expiry, expiryCustom: expiryCustom || undefined });
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  const resolved = resolveExpiry(
    parsed.data.expiry,
    new Date(),
    parsed.data.expiryCustom,
  );
  if (!resolved.ok) {
    return { ok: false, fieldErrors: { expiryCustom: [resolved.error] } };
  }

  try {
    await accessRepo.setGuestExpiry(
      getDb(),
      parsed.data.guestId,
      resolved.expiresAt,
    );
  } catch (error) {
    return failed('changeGuestExpiry', error);
  }
  refreshAdmin();
  return { ok: true };
}

export async function deleteGuest(guestId: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = idSchema.safeParse(guestId);
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  try {
    await guestsRepo.deleteGuest(getDb(), parsed.data);
  } catch (error) {
    return failed('deleteGuest', error);
  }
  refreshAdmin();
  return { ok: true };
}

export async function newPassword(
  guestId: string,
): Promise<ActionResult<{ password: string; reply: string }>> {
  await requireAdmin();
  const parsed = idSchema.safeParse(guestId);
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  try {
    const db = getDb();
    // Everything that can fail comes before the password changes
    const [guest, projects] = await Promise.all([
      accessRepo.getGuest(db, parsed.data),
      inviteProjects(),
    ]);
    const password = await guestsRepo.resetPassword(db, parsed.data);
    const reply = copyReplyText({
      name: guest?.name ?? '',
      password,
      expiresAt: guest?.expiresAt ?? null,
      projects,
    });
    refreshAdmin();
    return { ok: true, password, reply };
  } catch (error) {
    return failed('newPassword', error);
  }
}

/**
 * Emails the invitation Kiran wrote to the guest; replies go to Kiran.
 * With a requestId, a successful send marks that request as answered.
 */
export async function sendInvite(
  guestId: string,
  input: { subject: string; message: string },
  requestId?: string,
): Promise<ActionResult<{ sentTo: string }>> {
  await requireAdmin();
  const id = idSchema.safeParse(guestId);
  const parsed = inviteMessageSchema.safeParse(input);
  if (!id.success || !parsed.success) {
    return { ok: false, error: MESSAGES.invalid };
  }

  const from = guestSender();
  if (!from) return { ok: false, error: MESSAGES.emailNotSetUp };

  let to: string | null | undefined;
  try {
    to = (await accessRepo.getGuest(getDb(), id.data))?.email;
  } catch (error) {
    return failed('sendInvite', error);
  }
  if (!to) return { ok: false, error: MESSAGES.noEmail };

  const sent = await sendEmail({
    from,
    to,
    replyTo: CONTACT_EMAIL,
    subject: parsed.data.subject,
    text: parsed.data.message,
  });
  if (!sent) return { ok: false, error: MESSAGES.emailFailed };

  const request = idSchema.safeParse(requestId);
  if (request.success) {
    try {
      await requestsRepo.approveIfPending(getDb(), request.data);
      refreshAdmin();
    } catch (error) {
      // The email went out; the request just stays in the list
      console.error('Marking the request answered failed', error);
    }
  }
  return { ok: true, sentTo: to };
}

type GuestMessage = ActionResult<{
  guestId: string;
  name: string;
  email: string;
  reply: string;
}>;

const resumeSchema = z.object({
  expiry: expiryChoiceSchema,
  expiryCustom: expiryCustomSchema,
  requestId: idSchema.optional(),
  project: slugSchema.optional(),
});

/**
 * A paused or expired guest asked again: turns their access back on with the
 * same password and a new end date, and writes the message (links only).
 */
export async function resumeGuest(
  guestId: string,
  formData: FormData,
): Promise<GuestMessage> {
  await requireAdmin();
  const id = idSchema.safeParse(guestId);
  const parsed = resumeSchema.safeParse({
    expiry: text(formData, 'expiry'),
    expiryCustom: text(formData, 'expiryCustom') || undefined,
    requestId: text(formData, 'requestId') || undefined,
    project: text(formData, 'project') || undefined,
  });
  if (!id.success || !parsed.success) {
    return { ok: false, error: MESSAGES.invalid };
  }
  const expiry = resolveExpiry(
    parsed.data.expiry,
    new Date(),
    parsed.data.expiryCustom,
  );
  if (!expiry.ok) {
    return { ok: false, fieldErrors: { expiryCustom: [expiry.error] } };
  }

  try {
    const db = getDb();
    // Write the message first: it checks the guest exists and has an email,
    // so nothing changes when it can't be sent
    const result = await writeGuestMessage(id.data, {
      kind: 'resume',
      project: parsed.data.project,
      expiresAt: expiry.expiresAt,
    });
    if (!result.ok) return result;

    await accessRepo.resumeAccess(db, id.data, expiry.expiresAt);
    if (parsed.data.requestId) {
      await requestsRepo.approveIfPending(db, parsed.data.requestId);
    }
    refreshAdmin();
    return result;
  } catch (error) {
    return failed('resumeGuest', error);
  }
}

/** The project links again for a guest who still has access; changes nothing */
export async function guestMessage(
  guestId: string,
  project?: string,
): Promise<GuestMessage> {
  await requireAdmin();
  const id = idSchema.safeParse(guestId);
  const slug = slugSchema.optional().safeParse(project || undefined);
  if (!id.success || !slug.success) {
    return { ok: false, error: MESSAGES.invalid };
  }
  try {
    return await writeGuestMessage(id.data, {
      kind: 'reminder',
      project: slug.data,
    });
  } catch (error) {
    return failed('guestMessage', error);
  }
}

async function writeGuestMessage(
  guestId: string,
  options: {
    kind: 'resume' | 'reminder';
    project?: string;
    expiresAt?: Date | null;
  },
): Promise<GuestMessage> {
  const guest = await accessRepo.getGuest(getDb(), guestId);
  if (!guest) return { ok: false, error: MESSAGES.invalid };
  if (!guest.email) return { ok: false, error: MESSAGES.noEmail };
  return {
    ok: true,
    guestId,
    name: guest.name,
    email: guest.email,
    reply: copyReplyText({
      name: guest.name,
      password: null,
      expiresAt:
        options.expiresAt === undefined ? guest.expiresAt : options.expiresAt,
      projects: await inviteProjects(options.project),
      kind: options.kind,
    }),
  };
}

export async function updateGuest(
  guestId: string,
  patch: { name: string; note: string },
): Promise<ActionResult> {
  await requireAdmin();
  const id = idSchema.safeParse(guestId);
  if (!id.success) return { ok: false, error: MESSAGES.invalid };
  const parsed = updateGuestSchema.safeParse(patch);
  if (!parsed.success) return fieldErrors(parsed.error);

  try {
    await guestsRepo.updateGuest(getDb(), id.data, parsed.data);
  } catch (error) {
    return failed('updateGuest', error);
  }
  refreshAdmin();
  return { ok: true };
}

export async function logout() {
  await endSession();
}
