import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("LazyItemHost spinner CSS", () => {
  test("matches slider-style hidden-state fade defaults", () => {
    const css = readFileSync(
      new URL("./LazyItemHost.module.css", import.meta.url),
      "utf8"
    );

    expect(css).toContain("opacity: 0;");
    expect(css).toContain("visibility: hidden;");
    expect(css).toContain("transition: opacity 180ms ease;");
    expect(css).toContain("will-change: opacity;");
  });
});
