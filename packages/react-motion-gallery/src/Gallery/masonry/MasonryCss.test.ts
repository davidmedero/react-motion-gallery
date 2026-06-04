import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("Masonry reveal CSS", () => {
  test("targets only positioned item hosts for reveal fades", () => {
    const css = readFileSync(new URL("./Masonry.module.css", import.meta.url), "utf8");

    expect(css).toContain(".revealContainer > [data-rmg-idx]");
    expect(css).toContain(".revealContainer.revealActive > [data-rmg-idx]");
    expect(css).not.toContain(".revealContainer [data-rmg-idx] {");
    expect(css).not.toContain(".revealContainer.revealActive [data-rmg-idx] {");
  });

  test("keeps skeleton and loading classes out of masonry CSS", () => {
    const css = readFileSync(new URL("./Masonry.module.css", import.meta.url), "utf8");

    expect(css).not.toContain("masonryLoadingLayer");
    expect(css).not.toContain("masonrySkeleton");
  });

  test("keeps public split skeleton CSS in the global style merge", () => {
    const script = readFileSync(
      new URL("../../../scripts/merge_styles.mjs", import.meta.url),
      "utf8"
    );

    expect(script).not.toContain('"masonry-measured.css"');
    expect(script).not.toContain('"skeleton-masonry-structured.css"');
    expect(script).toContain('"skeleton-masonry.css"');
  });
});
