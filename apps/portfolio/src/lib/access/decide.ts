import type { AccessLevel } from "./levels";

type DecideInput = {
  level: AccessLevel | "unknown-db-down";
  isAdmin: boolean;
  hasGuestAccess: boolean;
  hasFallbackAccess: boolean;
};

export type AccessDecision = "allow" | "unlock" | "not-found";

/** Pure access rule. When the database is down nothing becomes more visible than before. */
export function decideAccess({
  level,
  isAdmin,
  hasGuestAccess,
  hasFallbackAccess,
}: DecideInput): AccessDecision {
  switch (level) {
    case "public":
      return "allow";
    case "admin":
      return isAdmin ? "allow" : "not-found";
    case "unlocked":
      return isAdmin || hasGuestAccess || hasFallbackAccess
        ? "allow"
        : "unlock";
    case "unknown-db-down":
      return isAdmin || hasFallbackAccess ? "allow" : "unlock";
  }
}
