import { describe, expect, test } from "vitest";

import { gapAllEdges } from "./dom";

describe("gapAllEdges", () => {
  test("ignores subpixel width differences caused by percentage layouts", () => {
    const imgEl = {
      getBoundingClientRect: () => ({
        width: 979,
        height: 550,
      }),
      offsetWidth: 979,
      offsetHeight: 550,
    } as unknown as HTMLImageElement;

    expect(gapAllEdges({ width: 979.2, height: 900 }, imgEl)).toBe(false);
  });

  test("still detects real gaps on both axes", () => {
    const imgEl = {
      getBoundingClientRect: () => ({
        width: 720,
        height: 405,
      }),
      offsetWidth: 720,
      offsetHeight: 405,
    } as unknown as HTMLImageElement;

    expect(gapAllEdges({ width: 980, height: 900 }, imgEl)).toBe(true);
  });
});
