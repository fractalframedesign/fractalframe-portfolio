import { expect, test } from 'vitest';

import { accessRequests } from '@/lib/db/schema';
import { createTestDb } from '@/lib/db/test-db';

import {
  approveIfPending,
  listPendingRequests,
  saveRequest,
  setRequestStatus,
} from './requests';

test('requests are saved, listed while pending and removed once decided', async () => {
  const db = await createTestDb();
  await saveRequest(db, {
    name: 'Ada',
    email: 'Ada@Example.com',
    message: 'Hi',
    productSlug: 'fintech-components',
  });
  const pending = await listPendingRequests(db);
  expect(pending).toHaveLength(1);
  expect(pending[0]!.email).toBe('ada@example.com');
  await setRequestStatus(db, pending[0]!.id, 'declined');
  expect(await listPendingRequests(db)).toEqual([]);
});

test('approving only changes a request that is still pending', async () => {
  const db = await createTestDb();
  await saveRequest(db, {
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hi',
    productSlug: 'fintech-components',
  });
  const [request] = await listPendingRequests(db);
  await setRequestStatus(db, request!.id, 'declined');
  await approveIfPending(db, request!.id);
  const rows = await db.select().from(accessRequests);
  expect(rows[0]!.status).toBe('declined');
});
