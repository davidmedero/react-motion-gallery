import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as rootEntry from "../../index";
import * as revealEntry from "../../reveal";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("reveal public entries", () => {
  test("exports Reveal from the root and reveal subpath", () => {
    expect(packageJson.exports["./reveal"]).toBeDefined();
    expect(revealEntry.Reveal).toBeDefined();
    expect(revealEntry.default).toBe(revealEntry.Reveal);
    expect(revealEntry.useReveal).toBeTypeOf("function");
    expect(revealEntry.resolveRevealTransform).toBeTypeOf("function");
    expect(rootEntry.Reveal).toBe(revealEntry.Reveal);
    expect(rootEntry.useReveal).toBe(revealEntry.useReveal);
  });
});
