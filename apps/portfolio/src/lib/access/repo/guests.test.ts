import { expect, test } from "vitest";

import { createTestDb } from "@/lib/db/test-db";

import {
  addGrant,
  createGuest,
  deleteGuest,
  findGrantByPassword,
  getGrantForToken,
  listGrantsByProduct,
  listGuests,
  recordVisit,
  resetPassword,
  setGrantExpiry,
  setGrantStatus,
  updateGuest,
} from "./guests";
import { seedProducts, setLevel } from "./products";

const NOW = new Date("2026-01-01T12:00:00Z");

async function setup() {
  const db = await createTestDb();
  await seedProducts(db);
  return db;
}

const base = {
  name: "Ada",
  email: "ada@example.com",
  products: ["fintech-components"],
  expiresAt: null,
  source: "manual" as const,
};

test("createGuest returns a password that findGrantByPassword accepts", async () => {
  const db = await setup();
  const { password, rotated } = await createGuest(db, base);
  expect(rotated).toBe(false);
  const found = await findGrantByPassword(
    db,
    "fintech-components",
    password.toUpperCase(),
    NOW,
  );
  expect(found?.grantId).toBeTruthy();
  expect(
    await findGrantByPassword(db, "fintech-components", "wrong-pass-11", NOW),
  ).toBeNull();
});

test("createGuest rejects projects that are not Unlocked", async () => {
  const db = await setup();
  await expect(
    createGuest(db, { ...base, products: ["bloom"] }),
  ).rejects.toThrow("Project isn't Unlocked");
});

test("findGrantByPassword ignores paused, expired and other-project grants", async () => {
  const db = await setup();
  await setLevel(db, "finance-dashboard", "unlocked");
  const { password } = await createGuest(db, {
    ...base,
    products: ["fintech-components", "finance-dashboard"],
  });
  const [grant] = await listGrantsByProduct(db, "fintech-components");
  expect(await findGrantByPassword(db, "bloom", password, NOW)).toBeNull();

  await setGrantStatus(db, grant!.grantId, "paused");
  expect(
    await findGrantByPassword(db, "fintech-components", password, NOW),
  ).toBeNull();
  expect(
    await findGrantByPassword(db, "finance-dashboard", password, NOW),
  ).not.toBeNull();

  await setGrantStatus(db, grant!.grantId, "active");
  await setGrantExpiry(db, grant!.grantId, new Date(NOW.getTime() - 1000));
  expect(
    await findGrantByPassword(db, "fintech-components", password, NOW),
  ).toBeNull();
});

test("approve reuses guest by email and rotates password", async () => {
  const db = await setup();
  const first = await createGuest(db, base);
  await setLevel(db, "finance-dashboard", "unlocked");
  const second = await createGuest(db, {
    ...base,
    email: " ADA@example.com ",
    products: ["finance-dashboard"],
    source: "request",
  });
  expect(second.guestId).toBe(first.guestId);
  expect(second.rotated).toBe(true);
  expect(
    await findGrantByPassword(db, "fintech-components", first.password, NOW),
  ).toBeNull();
  expect(
    await findGrantByPassword(db, "fintech-components", second.password, NOW),
  ).not.toBeNull();
  expect(
    await findGrantByPassword(db, "finance-dashboard", second.password, NOW),
  ).not.toBeNull();
  expect(await listGuests(db)).toHaveLength(1);
});

test("createGuest re-activates a paused grant when the guest is reused", async () => {
  const db = await setup();
  const first = await createGuest(db, base);
  const [grant] = await listGrantsByProduct(db, "fintech-components");
  await setGrantStatus(db, grant!.grantId, "paused");
  const expiresAt = new Date(NOW.getTime() + 86_400_000);
  const second = await createGuest(db, { ...base, expiresAt });
  expect(second.guestId).toBe(first.guestId);
  const [after] = await listGrantsByProduct(db, "fintech-components");
  expect(after!.status).toBe("active");
  expect(after!.expiresAt).toEqual(expiresAt);
});

test("pausing one grant leaves the guest's other grants active", async () => {
  const db = await setup();
  await setLevel(db, "finance-dashboard", "unlocked");
  const { password } = await createGuest(db, {
    ...base,
    products: ["fintech-components", "finance-dashboard"],
  });
  const [grant] = await listGrantsByProduct(db, "fintech-components");
  await setGrantStatus(db, grant!.grantId, "paused");
  expect(
    await findGrantByPassword(db, "finance-dashboard", password, NOW),
  ).not.toBeNull();
});

test("getGrantForToken reflects status, expiry and project level", async () => {
  const db = await setup();
  const { password } = await createGuest(db, base);
  const found = (await findGrantByPassword(
    db,
    "fintech-components",
    password,
    NOW,
  ))!;
  const view = await getGrantForToken(
    db,
    found.grantId,
    "fintech-components",
    NOW,
  );
  expect(view).toEqual({ passwordLookup: found.passwordLookup, active: true });

  await setLevel(db, "fintech-components", "public");
  expect(
    (await getGrantForToken(db, found.grantId, "fintech-components", NOW))
      ?.active,
  ).toBe(false);
  await setLevel(db, "fintech-components", "unlocked");
  await setGrantExpiry(db, found.grantId, new Date(NOW.getTime() - 1));
  expect(
    (await getGrantForToken(db, found.grantId, "fintech-components", NOW))
      ?.active,
  ).toBe(false);
  expect(
    await getGrantForToken(
      db,
      "00000000-0000-0000-0000-000000000000",
      "fintech-components",
      NOW,
    ),
  ).toBeNull();
});

test("resetPassword invalidates the old password", async () => {
  const db = await setup();
  const { guestId, password } = await createGuest(db, base);
  const next = await resetPassword(db, guestId);
  expect(next).not.toBe(password);
  expect(
    await findGrantByPassword(db, "fintech-components", password, NOW),
  ).toBeNull();
  expect(
    await findGrantByPassword(db, "fintech-components", next, NOW),
  ).not.toBeNull();
});

test("recordVisit counts at most once per hour", async () => {
  const db = await setup();
  await createGuest(db, base);
  const [grant] = await listGrantsByProduct(db, "fintech-components");
  const at = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);
  await recordVisit(db, grant!.grantId, at(0));
  await recordVisit(db, grant!.grantId, at(30));
  await recordVisit(db, grant!.grantId, at(61));
  const [after] = await listGrantsByProduct(db, "fintech-components");
  expect(after!.visitCount).toBe(2);
  expect(after!.lastVisitAt).toEqual(at(61));
});

test("deleteGuest removes their grants", async () => {
  const db = await setup();
  const { guestId } = await createGuest(db, base);
  await deleteGuest(db, guestId);
  expect(await listGrantsByProduct(db, "fintech-components")).toEqual([]);
  expect(await listGuests(db)).toEqual([]);
});

test("addGrant, updateGuest and listGuests work together", async () => {
  const db = await setup();
  await setLevel(db, "finance-dashboard", "unlocked");
  const { guestId } = await createGuest(db, base);
  await addGrant(db, guestId, "finance-dashboard", null);
  await updateGuest(db, guestId, { note: "friend" });
  const [guest] = await listGuests(db);
  expect(guest!.note).toBe("friend");
  expect(guest!.name).toBe("Ada");
  expect(guest!.grants).toHaveLength(2);
});

test("findGrantByPassword ignores grants whose project is no longer Unlocked", async () => {
  const db = await setup();
  const { password } = await createGuest(db, base);
  await setLevel(db, "fintech-components", "public");
  expect(
    await findGrantByPassword(db, "fintech-components", password, NOW),
  ).toBeNull();
});
