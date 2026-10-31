import { expect, test } from "vitest";

import { createTestDb } from "@/lib/db/test-db";

import { clearFailures, isLocked, recordFailure } from "./rate-limit";

const T = new Date("2026-01-01T12:00:00Z");
const min = (m: number) => new Date(T.getTime() + m * 60_000);

test("rate limit locks after 5 failures for 15 minutes and resets after", async () => {
  const db = await createTestDb();
  for (let i = 0; i < 4; i++) await recordFailure(db, "ip", min(i));
  expect(await isLocked(db, "ip", min(4))).toBe(false);
  await recordFailure(db, "ip", min(4));
  expect(await isLocked(db, "ip", min(5))).toBe(true);
  expect(await isLocked(db, "ip", min(18.9))).toBe(true);
  expect(await isLocked(db, "ip", min(19))).toBe(false);

  await recordFailure(db, "ip", min(40));
  expect(await isLocked(db, "ip", min(41))).toBe(false);
  for (let i = 0; i < 3; i++) await recordFailure(db, "ip", min(41 + i));
  expect(await isLocked(db, "ip", min(45))).toBe(false);
  await recordFailure(db, "ip", min(45));
  expect(await isLocked(db, "ip", min(46))).toBe(true);
});

test("clearFailures and keys are independent", async () => {
  const db = await createTestDb();
  for (let i = 0; i < 5; i++) await recordFailure(db, "a", min(i));
  expect(await isLocked(db, "b", min(5))).toBe(false);
  await clearFailures(db, "a");
  expect(await isLocked(db, "a", min(5))).toBe(false);
});

test("concurrent failures cannot slip past the limit", async () => {
  const db = await createTestDb();
  await Promise.all(
    Array.from({ length: 10 }, () => recordFailure(db, "ip", min(0))),
  );
  expect(await isLocked(db, "ip", min(1))).toBe(true);
});
