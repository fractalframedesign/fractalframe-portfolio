import { beforeEach, describe, expect, test, vi } from "vitest";

import { checkAdminLogin } from "@/lib/access/admin-password";
import {
  ADMIN_COOKIE,
  createAdminSession,
  readAdminSession,
} from "@/lib/access/admin-session";
import type { Db } from "@/lib/db/client";
import { createTestDb } from "@/lib/db/test-db";

import { changePassword } from "./actions";

const delay = vi.hoisted(() => vi.fn(async (_ms: number) => {}));

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  dbDown: false,
  cookies: new Map<string, string>(),
}));

vi.mock("@/lib/db/client", () => ({
  getDb: () => {
    if (state.dbDown) throw new Error("DATABASE_URL is not set");
    return state.db;
  },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = state.cookies.get(name);
      return value ? { name, value } : undefined;
    },
    set: (name: string, value: string) => state.cookies.set(name, value),
  }),
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));
vi.mock("@/lib/access/login-delay", () => ({ loginDelay: delay }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const NEW = "a brand new password";

function submit(
  currentPassword: string,
  newPassword = NEW,
  confirmPassword = newPassword,
) {
  const data = new FormData();
  data.set("currentPassword", currentPassword);
  data.set("newPassword", newPassword);
  data.set("confirmPassword", confirmPassword);
  return changePassword({}, data);
}

beforeEach(async () => {
  state.db = await createTestDb();
  state.dbDown = false;
  state.cookies.clear();
  state.cookies.set(
    ADMIN_COOKIE,
    await createAdminSession(new Date(Date.now() - 60_000), true),
  );
  delay.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("changePassword", () => {
  test("needs an admin session", async () => {
    state.cookies.clear();
    await expect(submit("test-admin-password")).rejects.toThrow(
      "REDIRECT:/admin/login",
    );
  });

  test("saves the new password and renews this session", async () => {
    const before = state.cookies.get(ADMIN_COOKIE);
    expect(await submit("test-admin-password")).toEqual({ saved: true });

    const db = state.db as Db;
    expect(await checkAdminLogin(db, NEW)).toBe(true);
    expect(await checkAdminLogin(db, "test-admin-password")).toBe(false);

    const after = state.cookies.get(ADMIN_COOKIE);
    expect(after).not.toBe(before);
    expect(await readAdminSession(after, new Date())).toMatchObject({
      rememberMe: true,
    });
  });

  test("checks the new password before the current one", async () => {
    expect(await submit("test-admin-password", "short")).toEqual({
      error: "Use at least 12 characters.",
      field: "newPassword",
    });
    expect(await submit("test-admin-password", NEW, `${NEW}!`)).toEqual({
      error: "The new passwords don’t match.",
      field: "confirmPassword",
    });
    expect(
      await submit("test-admin-password-x", "test-admin-password-x"),
    ).toEqual({
      error: "Choose a password different from your current one.",
      field: "newPassword",
    });
    expect(await checkAdminLogin(state.db as Db, NEW)).toBe(false);
  });

  test("a wrong current password waits, counts and changes nothing", async () => {
    expect(await submit("nope")).toEqual({
      error: "Your current password isn’t right.",
      field: "currentPassword",
    });
    expect(delay).toHaveBeenCalledWith(1000);
    expect(await checkAdminLogin(state.db as Db, NEW)).toBe(false);
  });

  test("locks after 5 wrong tries", async () => {
    for (let i = 0; i < 5; i++) await submit("nope");
    expect(await submit("test-admin-password")).toEqual({
      error: "Too many tries. Try again in 15 minutes.",
      field: "currentPassword",
    });
  });

  test("with the database down nothing is saved", async () => {
    state.dbDown = true;
    expect(await submit("test-admin-password")).toEqual({
      error: "Couldn’t save. Nothing changed. Try again in a minute.",
    });
  });
});
