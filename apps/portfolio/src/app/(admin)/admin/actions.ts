'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';

import { LEVELS_TAG } from '@/lib/access/cached-levels';
import {
  expiryChoiceSchema,
  isGrantActive,
  resolveExpiry,
} from '@/lib/access/expiry';
import { canBeUnlocked, resolveLevel } from '@/lib/access/levels';
import { copyReplyText } from '@/lib/access/reply';
import * as guestsRepo from '@/lib/access/repo/guests';
import * as productsRepo from '@/lib/access/repo/products';
import * as requestsRepo from '@/lib/access/repo/requests';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';
import { getAllProjects } from '@/lib/projects';

import { logout as endSession } from './login/actions';

export type ActionError = {
  ok: false;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | ActionError;
export type PasswordResult = ActionResult<{
  password: string;
  rotated: boolean;
  reply: string;
}>;

const MESSAGES = {
  generic: 'Something went wrong. Try again.',
  invalid: 'That didn’t look right. Reload the page and try again.',
  notUnlocked: 'Only Unlocked projects can be picked.',
  noDemo: 'Only projects with a demo can be Unlocked.',
  unknownProject: 'That project doesn’t exist.',
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
  .max(254, 'Enter a valid email, or leave it empty.')
  .refine(
    (value) => value === '' || z.email().safeParse(value).success,
    'Enter a valid email, or leave it empty.',
  );
const idSchema = z.uuid();
const slugSchema = z.string().regex(/^[a-z0-9-]{1,100}$/);
const levelSchema = z.enum(['public', 'unlocked', 'admin']);
const expiryCustomSchema = z.string().max(20).optional();

const addGuestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  note: noteSchema,
  products: z
    .array(slugSchema)
    .min(1, 'Pick at least one project.')
    .max(50),
  expiry: expiryChoiceSchema,
  expiryCustom: expiryCustomSchema,
  requestId: idSchema.optional(),
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
  if (parsed.data.level === 'unlocked' && !canBeUnlocked(parsed.data.slug)) {
    return { ok: false, error: MESSAGES.noDemo };
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
    products: formData.getAll('products'),
    expiry: text(formData, 'expiry'),
    expiryCustom: text(formData, 'expiryCustom') || undefined,
    requestId: text(formData, 'requestId') || undefined,
  });
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
    const levels = await productsRepo.getStoredLevels(db);
    const products = [...new Set(input.products)];
    if (products.some((slug) => resolveLevel(slug, levels) !== 'unlocked')) {
      return { ok: false, fieldErrors: { products: [MESSAGES.notUnlocked] } };
    }

    const { password, rotated } = await guestsRepo.createGuest(db, {
      name: input.name,
      email: input.email || undefined,
      note: input.note,
      products,
      expiresAt: expiry.expiresAt,
      source: input.requestId ? 'request' : 'manual',
    });
    if (input.requestId) {
      await requestsRepo.setRequestStatus(db, input.requestId, 'approved');
    }

    const names = await projectNames();
    refreshAdmin();
    return {
      ok: true,
      password,
      rotated,
      reply: copyReplyText({
        name: input.name,
        projectNames: products.map((slug) => names.get(slug) ?? slug),
        password,
        expiresAt: expiry.expiresAt,
      }),
    };
  } catch (error) {
    return failed('addGuest', error);
  }
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

export async function setGrantStatus(
  grantId: string,
  status: 'active' | 'paused',
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({ grantId: idSchema, status: z.enum(['active', 'paused']) })
    .safeParse({ grantId, status });
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  try {
    await guestsRepo.setGrantStatus(
      getDb(),
      parsed.data.grantId,
      parsed.data.status,
    );
  } catch (error) {
    return failed('setGrantStatus', error);
  }
  refreshAdmin();
  return { ok: true };
}

// craftsman-ignore PARAM001: three parameters, signature fixed by the plan
export async function changeExpiry(
  grantId: string,
  expiry: string,
  expiryCustom?: string,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({
      grantId: idSchema,
      expiry: expiryChoiceSchema,
      expiryCustom: expiryCustomSchema,
    })
    .safeParse({ grantId, expiry, expiryCustom: expiryCustom || undefined });
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
    await guestsRepo.setGrantExpiry(
      getDb(),
      parsed.data.grantId,
      resolved.expiresAt,
    );
  } catch (error) {
    return failed('changeExpiry', error);
  }
  refreshAdmin();
  return { ok: true };
}

export async function removeGrant(grantId: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = idSchema.safeParse(grantId);
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  try {
    await guestsRepo.removeGrant(getDb(), parsed.data);
  } catch (error) {
    return failed('removeGrant', error);
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

/** One expiry for the reply only when every listed grant shares it */
function sharedExpiry(expiries: (Date | null)[]) {
  const [first] = expiries;
  if (!first) return null;
  return expiries.every((date) => date?.getTime() === first.getTime())
    ? first
    : null;
}

export async function newPassword(
  guestId: string,
): Promise<ActionResult<{ password: string; reply: string }>> {
  await requireAdmin();
  const parsed = idSchema.safeParse(guestId);
  if (!parsed.success) return { ok: false, error: MESSAGES.invalid };

  try {
    const db = getDb();
    const password = await guestsRepo.resetPassword(db, parsed.data);
    const [guests, levels, names] = await Promise.all([
      guestsRepo.listGuests(db),
      productsRepo.getStoredLevels(db),
      projectNames(),
    ]);
    const guest = guests.find((entry) => entry.guestId === parsed.data);
    const now = new Date();
    const open = (guest?.grants ?? []).filter(
      (grant) =>
        isGrantActive(grant, now) &&
        resolveLevel(grant.productSlug, levels) === 'unlocked',
    );

    refreshAdmin();
    return {
      ok: true,
      password,
      reply: copyReplyText({
        name: guest?.name ?? '',
        projectNames: open.map(
          (grant) => names.get(grant.productSlug) ?? grant.productSlug,
        ),
        password,
        expiresAt: sharedExpiry(open.map((grant) => grant.expiresAt)),
      }),
    };
  } catch (error) {
    return failed('newPassword', error);
  }
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
