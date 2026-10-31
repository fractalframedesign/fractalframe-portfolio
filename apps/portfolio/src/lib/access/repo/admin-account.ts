import type { Db } from "@/lib/db/client";
import { adminAccount } from "@/lib/db/schema";

const OWNER = "owner";

export async function getAdminAccount(db: Db) {
  const [row] = await db
    .select({
      passwordHash: adminAccount.passwordHash,
      passwordChangedAt: adminAccount.passwordChangedAt,
    })
    .from(adminAccount)
    .limit(1);
  return row;
}

export async function setAdminPassword(
  db: Db,
  passwordHash: string,
  now: Date,
) {
  await db
    .insert(adminAccount)
    .values({ id: OWNER, passwordHash, passwordChangedAt: now })
    .onConflictDoUpdate({
      target: adminAccount.id,
      set: { passwordHash, passwordChangedAt: now },
    });
}
