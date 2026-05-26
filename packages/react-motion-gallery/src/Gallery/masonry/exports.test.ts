import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as masonryEntry from "../../masonry";
import * as masonryReadyEntry from "../../masonry-ready";
import * as masonryMeasuredEntry from "../../masonry-measured";
import * as masonryMeasuredReadyEntry from "../../masonry-measured-ready";
import * as masonryFullscreenEntry from "../../masonry-fullscreen";
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
    expect(packageJson.exports["./masonry/measured"]).toBeDefined();
    expect(packageJson.exports["./masonry/measured/ready"]).toBeDefined();
    expect(masonryMeasuredEntry.Masonry).toBeDefined();
    expect(masonryMeasuredEntry.useMasonryReady).toBe(masonryMeasuredReadyEntry.useMasonryReady);
  });

  test("exports masonry lazy-load as a dedicated plugin subpath", () => {
    expect(packageJson.exports["./masonry/lazy-load"]).toBeDefined();
    expect(masonryLazyLoadEntry.masonryLazyLoad).toBeTypeOf("function");
    expect(masonryLazyLoadEntry.masonryLazyLoad()).toMatchObject({
      __rmgMasonryPlugin: true,
      __rmgLightMasonryPlugin: true,
      kind: "lazy-load",
      blocksReady: true,
    });
    expect(masonryLazyLoadEntry.masonryLazyLoad({ enabled: false })).toMatchObject({
      __rmgMasonryPlugin: true,
      __rmgLightMasonryPlugin: true,
      kind: "lazy-load",
      blocksReady: false,
    });
  });

  test("exports masonry fullscreen as a dedicated light plugin subpath", () => {
    expect(packageJson.exports["./masonry/fullscreen"]).toBeDefined();
    expect(masonryFullscreenEntry.masonryFullscreen).toBeTypeOf("function");
    expect(masonryFullscreenEntry.resolveMasonryFullscreenClick).toBeTypeOf("function");
    expect(masonryFullscreenEntry.masonryFullscreen()).toMatchObject({
      __rmgLightMasonryPlugin: true,
      kind: "fullscreen",
    });
  });
});
