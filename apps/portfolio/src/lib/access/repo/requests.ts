import { asc, eq } from 'drizzle-orm';

import type { Db } from '@/lib/db/client';
import { accessRequests } from '@/lib/db/schema';

export async function saveRequest(
  db: Db,
  input: { name: string; email: string; message: string; productSlug: string },
) {
  await db.insert(accessRequests).values({
    ...input,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
  });
}

export async function listPendingRequests(db: Db) {
  return db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.status, 'pending'))
    .orderBy(asc(accessRequests.createdAt));
}

export async function setRequestStatus(
  db: Db,
  id: string,
  status: 'approved' | 'declined',
) {
  await db
    .update(accessRequests)
    .set({ status })
    .where(eq(accessRequests.id, id));
}
