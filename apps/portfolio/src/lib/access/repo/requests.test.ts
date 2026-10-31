import { expect, test } from "vitest";

import { createTestDb } from "@/lib/db/test-db";

import { listPendingRequests, saveRequest, setRequestStatus } from "./requests";

test("requests are saved, listed while pending and removed once decided", async () => {
  const db = await createTestDb();
  await saveRequest(db, {
    name: "Ada",
    email: "Ada@Example.com",
    message: "Hi",
    productSlug: "fintech-components",
  });
  const pending = await listPendingRequests(db);
  expect(pending).toHaveLength(1);
  expect(pending[0]!.email).toBe("ada@example.com");
  await setRequestStatus(db, pending[0]!.id, "declined");
  expect(await listPendingRequests(db)).toEqual([]);
});
