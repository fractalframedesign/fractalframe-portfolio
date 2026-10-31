import { TZDate } from "@date-fns/tz";
import { z } from "zod";

import { LOCATION } from "@/lib/constants";

export const expiryChoiceSchema = z.enum([
  "24h",
  "48h",
  "7d",
  "30d",
  "custom",
  "never",
]);
export type ExpiryChoice = z.infer<typeof expiryChoiceSchema>;

const HOUR = 3_600_000;
const PRESET_HOURS = { "24h": 24, "48h": 48, "7d": 168, "30d": 720 } as const;

type ExpiryResult =
  { ok: true; expiresAt: Date | null } | { ok: false; error: string };

/** `customLocal` is a datetime-local value (YYYY-MM-DDTHH:mm) in LOCATION.timeZone */
export function resolveExpiry(
  choice: ExpiryChoice,
  now: Date,
  customLocal?: string,
): ExpiryResult {
  if (choice === "never") return { ok: true, expiresAt: null };
  if (choice !== "custom") {
    return {
      ok: true,
      expiresAt: new Date(now.getTime() + PRESET_HOURS[choice] * HOUR),
    };
  }

  const match = customLocal?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return { ok: false, error: "Pick a date and time." };

  const [year, month, day, hour, minute] = match.slice(1).map(Number) as [
    number,
    number,
    number,
    number,
    number,
  ];
  const zoned = new TZDate(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    LOCATION.timeZone,
  );
  const expiresAt = new Date(zoned.getTime());
  if (Number.isNaN(expiresAt.getTime()))
    return { ok: false, error: "Pick a date and time." };
  if (expiresAt.getTime() <= now.getTime())
    return { ok: false, error: "Pick a time in the future." };

  return { ok: true, expiresAt };
}

export function timeLeftLabel(expiresAt: Date | null, now: Date) {
  if (!expiresAt) return "No expiry";
  const ms = expiresAt.getTime() - now.getTime();
  if (ms <= 0) return "Expired";

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `Expires in ${Math.max(minutes, 1)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Expires in ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Expires in ${days} ${days === 1 ? "day" : "days"}`;
}

export function isGrantActive(
  grant: { status: "active" | "paused"; expiresAt: Date | null },
  now: Date,
) {
  return (
    grant.status === "active" &&
    (grant.expiresAt === null || grant.expiresAt.getTime() > now.getTime())
  );
}
