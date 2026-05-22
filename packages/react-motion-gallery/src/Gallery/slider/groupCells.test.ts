import { describe, expect, test } from "vitest";

import { resolveResponsiveSliderGroupCells } from "./groupCells";

describe("slider responsive groupCells", () => {
  test("resolves boolean groupCells without breakpoint lookup", () => {
    expect(resolveResponsiveSliderGroupCells(true, 500)).toBe(true);
    expect(resolveResponsiveSliderGroupCells(false, 500)).toBe(false);
    expect(resolveResponsiveSliderGroupCells(undefined, 500)).toBe(false);
  });

  test("treats responsive numeric one as ungrouped and updates across breakpoints", () => {
    const value = { 0: 1, wide: 3 };
    const breakpoints = { wide: 800 };

    expect(resolveResponsiveSliderGroupCells(value, 500, breakpoints)).toBe(false);
    expect(resolveResponsiveSliderGroupCells(value, 900, breakpoints)).toBe(3);
  });

  test("truncates responsive numeric counts and ignores invalid counts", () => {
    expect(resolveResponsiveSliderGroupCells({ 0: 2.8 }, 500)).toBe(2);
    expect(resolveResponsiveSliderGroupCells({ 0: 1.8 }, 500)).toBe(false);
    expect(resolveResponsiveSliderGroupCells({ 0: 0 }, 500)).toBe(false);
  });
});
