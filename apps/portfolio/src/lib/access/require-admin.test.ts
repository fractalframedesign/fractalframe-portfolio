import { beforeEach, describe, expect, test, vi } from "vitest";

import { ADMIN_COOKIE, createAdminSession } from "./admin-session";
import { requireAdmin } from "./require-admin";

const state = vi.hoisted(() => ({ token: undefined as string | undefined }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "admin-session" && state.token
        ? { name, value: state.token }
        : undefined,
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

beforeEach(() => {
  state.token = undefined;
});

describe("requireAdmin", () => {
  test("redirects to login without a session", async () => {
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
    state.token = "garbage";
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
  });

  test("passes with a valid session", async () => {
    state.token = await createAdminSession(new Date());
    await expect(requireAdmin()).resolves.toBeUndefined();
    expect(ADMIN_COOKIE).toBe("admin-session");
  });
});
