import { describe, expect, test } from "vitest";

import {
  normalizeResponsiveNumberRules,
  parseLengthLike,
  resolveBooleanFromResponsive,
  resolveLengthFromResponsive,
  resolveNumberFromResponsive,
  resolveResponsiveNumberRuleValue,
} from "./responsive";

describe("responsive length helpers", () => {
  test("supports numbers, px strings, bare numeric strings, and viewport-relative percentages", () => {
    expect(parseLengthLike(400, 280, 1440)).toBe(400);
    expect(parseLengthLike("400px", 280, 1440)).toBe(400);
    expect(parseLengthLike("400", 280, 1440)).toBe(400);
    expect(parseLengthLike("50%", 280, 1440)).toBe(720);
    expect(parseLengthLike("25%", 200, 900)).toBe(225);
  });

  test("falls back for unsupported or invalid length strings", () => {
    expect(parseLengthLike("2rem", 280, 1440)).toBe(280);
    expect(parseLengthLike("calc(50% - 1rem)", 200, 900)).toBe(200);
    expect(parseLengthLike("nope", 200, 900)).toBe(200);
  });

  test("switches breakpoints by viewport width while resolving percentages against the supplied reference size", () => {
    expect(
      resolveLengthFromResponsive(
        { 0: "30%", 1200: "400px" },
        280,
        800,
        800
      )
    ).toBe(240);

    expect(
      resolveLengthFromResponsive(
        { 0: "30%", 1200: "400px" },
        280,
        1440,
        1440
      )
    ).toBe(400);

    expect(
      resolveLengthFromResponsive(
        { 0: "20%", 1000: 280 },
        200,
        900,
        900
      )
    ).toBe(180);

    expect(
      resolveLengthFromResponsive(
        { 0: "20%", 1000: 280 },
        200,
        1200,
        900
      )
    ).toBe(280);
  });

  test("keeps the number-only responsive resolver unchanged for existing callers", () => {
    expect(resolveNumberFromResponsive({ 0: 2, 900: 4 }, 1, 800)).toBe(2);
    expect(resolveNumberFromResponsive({ 0: 2, 900: 4 }, 1, 1200)).toBe(4);
  });

  test("normalizes responsive number rules from named and numeric breakpoints", () => {
    expect(
      normalizeResponsiveNumberRules({
        md: 640,
        1200: 960,
        0: 320,
      })
    ).toEqual([
      { minWidth: 0, value: 320 },
      { minWidth: 900, value: 640 },
      { minWidth: 1200, value: 960 },
    ]);
  });

  test("resolves responsive number rules using exact min-width boundaries", () => {
    const rules = normalizeResponsiveNumberRules({
      0: 320,
      640: 640,
      1024: 960,
    });

    expect(resolveResponsiveNumberRuleValue(rules, 639)).toBe(320);
    expect(resolveResponsiveNumberRuleValue(rules, 640)).toBe(640);
    expect(resolveResponsiveNumberRuleValue(rules, 1024)).toBe(960);
  });

  test("still normalizes standard responsive number rules for existing non-SSR callers", () => {
    const rules = normalizeResponsiveNumberRules({
      md: 640,
      lg: 960,
    });

    expect(resolveResponsiveNumberRuleValue(rules, 899)).toBeUndefined();
    expect(resolveResponsiveNumberRuleValue(rules, 900)).toBe(640);
  });

  test("resolves responsive booleans from named and numeric breakpoints", () => {
    const value = {
      xs: false,
      md: true,
      1200: false,
    };

    expect(resolveBooleanFromResponsive(undefined, true, 500)).toBe(true);
    expect(resolveBooleanFromResponsive(false, true, 500)).toBe(false);
    expect(resolveBooleanFromResponsive(value, true, 500)).toBe(false);
    expect(resolveBooleanFromResponsive(value, false, 960)).toBe(true);
    expect(resolveBooleanFromResponsive(value, true, 1280)).toBe(false);
  });
});
