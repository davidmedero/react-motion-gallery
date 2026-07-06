import { describe, expect, test } from "vitest";

import { Limit } from "./limit";
import { ScrollLooper } from "./scrollLooper";
import { Vector1D } from "./vector1d";

describe("ScrollLooper", () => {
  test("returns 0 when no loop shift is applied", () => {
    const location = Vector1D(-50);
    const target = Vector1D(-50);
    const looper = ScrollLooper(100, Limit(-100, 0), location, [location, target]);

    expect(looper.loop(1)).toBe(0);
    expect(location.get()).toBe(-50);
    expect(target.get()).toBe(-50);
  });

  test("returns and applies a negative shift when crossing the max seam", () => {
    const location = Vector1D(0.2);
    const target = Vector1D(0.2);
    const looper = ScrollLooper(100, Limit(-100, 0), location, [location, target]);

    expect(looper.loop(1)).toBe(-100);
    expect(location.get()).toBeCloseTo(-99.8);
    expect(target.get()).toBeCloseTo(-99.8);
  });

  test("returns and applies a positive shift when crossing the min seam", () => {
    const location = Vector1D(-100.2);
    const target = Vector1D(-100.2);
    const looper = ScrollLooper(100, Limit(-100, 0), location, [location, target]);

    expect(looper.loop(-1)).toBe(100);
    expect(location.get()).toBeCloseTo(-0.2);
    expect(target.get()).toBeCloseTo(-0.2);
  });
});
