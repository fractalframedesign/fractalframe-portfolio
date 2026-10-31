import { describe, expect, test } from "vitest";

import { isGrantActive, resolveExpiry, timeLeftLabel } from "./expiry";

const now = new Date("2026-10-31T00:00:00Z");

describe("resolveExpiry", () => {
  test("presets", () => {
    expect(resolveExpiry("24h", now)).toEqual({
      ok: true,
      expiresAt: new Date("2026-11-01T00:00:00Z"),
    });
    expect(resolveExpiry("48h", now)).toEqual({
      ok: true,
      expiresAt: new Date("2026-11-02T00:00:00Z"),
    });
    expect(resolveExpiry("7d", now)).toEqual({
      ok: true,
      expiresAt: new Date("2026-11-07T00:00:00Z"),
    });
    expect(resolveExpiry("30d", now)).toEqual({
      ok: true,
      expiresAt: new Date("2026-11-30T00:00:00Z"),
    });
    expect(resolveExpiry("never", now)).toEqual({ ok: true, expiresAt: null });
  });

  test("custom is read in Asia/Tokyo", () => {
    expect(resolveExpiry("custom", now, "2026-11-02T18:00")).toEqual({
      ok: true,
      expiresAt: new Date("2026-11-02T09:00:00Z"),
    });
  });

  test("rejects custom expiry in the past", () =>
    expect(resolveExpiry("custom", now, "2026-10-30T10:00")).toEqual({
      ok: false,
      error: "Pick a time in the future.",
    }));

  test("rejects missing or invalid custom", () => {
    const err = { ok: false, error: "Pick a date and time." };
    expect(resolveExpiry("custom", now)).toEqual(err);
    expect(resolveExpiry("custom", now, "")).toEqual(err);
    expect(resolveExpiry("custom", now, "nonsense")).toEqual(err);
  });
});

describe("timeLeftLabel", () => {
  test("labels", () => {
    expect(timeLeftLabel(null, now)).toBe("No expiry");
    expect(timeLeftLabel(new Date("2026-10-30T00:00:00Z"), now)).toBe(
      "Expired",
    );
    expect(timeLeftLabel(now, now)).toBe("Expired");
    expect(timeLeftLabel(new Date("2026-10-31T00:45:00Z"), now)).toBe(
      "Expires in 45 min",
    );
    expect(timeLeftLabel(new Date("2026-10-31T05:00:00Z"), now)).toBe(
      "Expires in 5 h",
    );
    expect(timeLeftLabel(new Date("2026-11-03T00:00:00Z"), now)).toBe(
      "Expires in 3 days",
    );
  });
});

describe("isGrantActive", () => {
  test("requires active status and unexpired", () => {
    const future = new Date("2026-11-01T00:00:00Z");
    expect(isGrantActive({ status: "active", expiresAt: null }, now)).toBe(
      true,
    );
    expect(isGrantActive({ status: "active", expiresAt: future }, now)).toBe(
      true,
    );
    expect(isGrantActive({ status: "active", expiresAt: now }, now)).toBe(
      false,
    );
    expect(isGrantActive({ status: "paused", expiresAt: null }, now)).toBe(
      false,
    );
  });
});
