import { describe, expect, test } from "vitest";

import {
  parseLengthLike,
  resolveLengthFromResponsive,
  resolveNumberFromResponsive,
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
});
