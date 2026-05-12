import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as masonryEntry from "../../masonry";
import * as masonryReadyEntry from "../../masonry-ready";
import * as masonryLazyLoadEntry from "../../masonry-lazy-load";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("masonry public entries", () => {
  test("exports masonry readiness through the masonry entry and dedicated subpath", () => {
    expect(masonryEntry.Masonry).toBeDefined();
    expect(masonryEntry.default).toBe(masonryEntry.Masonry);
    expect(masonryEntry.useMasonryReady).toBeTypeOf("function");
    expect(packageJson.exports["./masonry/ready"]).toBeDefined();
    expect(masonryReadyEntry.useMasonryReady).toBe(masonryEntry.useMasonryReady);
  });

  test("exports masonry lazy-load as a dedicated plugin subpath", () => {
    expect(packageJson.exports["./masonry/lazy-load"]).toBeDefined();
    expect(masonryLazyLoadEntry.masonryLazyLoad).toBeTypeOf("function");
    expect(masonryLazyLoadEntry.masonryLazyLoad()).toMatchObject({
      __rmgMasonryPlugin: true,
      kind: "lazy-load",
      blocksReady: true,
    });
    expect(masonryLazyLoadEntry.masonryLazyLoad({ enabled: false })).toMatchObject({
      __rmgMasonryPlugin: true,
      kind: "lazy-load",
      blocksReady: false,
    });
  });
});
