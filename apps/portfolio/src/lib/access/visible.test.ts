import { describe, expect, it } from "vitest";

import type { AccessLevel } from "./levels";
import { visibleProjects } from "./visible";

const levels = new Map<string, AccessLevel>([
  ["a", "public"],
  ["b", "admin"],
  ["c", "unlocked"],
  ["d", "public"],
]);

describe("visibleProjects", () => {
  it("drops admin and unknown slugs", () => {
    const result = visibleProjects(
      [{ slug: "a" }, { slug: "b" }, { slug: "nope" }],
      levels,
    );
    expect(result.map((p) => p.slug)).toEqual(["a"]);
  });

  it("keeps unlocked ones marked locked", () => {
    const result = visibleProjects([{ slug: "a" }, { slug: "c" }], levels);
    expect(result).toEqual([
      { slug: "a", locked: false },
      { slug: "c", locked: true },
    ]);
  });

  it("preserves order and extra fields", () => {
    const result = visibleProjects(
      [
        { slug: "d", name: "D" },
        { slug: "c", name: "C" },
        { slug: "a", name: "A" },
      ],
      levels,
    );
    expect(result.map((p) => p.name)).toEqual(["D", "C", "A"]);
  });
});
