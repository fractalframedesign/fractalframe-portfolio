'use server';

import { z } from 'zod';

import { searchGuests } from '@/lib/access/admin-queries';
import { requireAdmin } from '@/lib/access/require-admin';
import { getDb } from '@/lib/db/client';

const querySchema = z.string().max(100);

export type GuestSearchResult = {
  guestId: string;
  name: string;
  email: string | null;
};

export async function searchGuestsAction(
  query: string,
): Promise<GuestSearchResult[]> {
  await requireAdmin();

  const parsed = querySchema.safeParse(query);
  if (!parsed.success) return [];

  try {
    return await searchGuests(getDb(), parsed.data);
  } catch (error) {
    console.error('Guest search failed', error);
    return [];
  }
}
