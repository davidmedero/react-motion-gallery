import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as masonryEntry from "../../masonry";
import * as masonryReadyEntry from "../../masonry-ready";

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
});
