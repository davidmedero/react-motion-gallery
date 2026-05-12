import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("Masonry intro CSS", () => {
  test("targets only positioned item hosts for intro fades", () => {
    const css = readFileSync(new URL("./Masonry.module.css", import.meta.url), "utf8");

    expect(css).toContain(".introContainer > [data-rmg-idx]");
    expect(css).toContain(".introContainer.introActive > [data-rmg-idx]");
    expect(css).not.toContain(".introContainer [data-rmg-idx] {");
    expect(css).not.toContain(".introContainer.introActive [data-rmg-idx] {");
  });

  test("keeps skeleton and loading classes out of masonry CSS", () => {
    const css = readFileSync(new URL("./Masonry.module.css", import.meta.url), "utf8");

    expect(css).not.toContain("masonryLoadingLayer");
    expect(css).not.toContain("masonrySkeleton");
  });
});
