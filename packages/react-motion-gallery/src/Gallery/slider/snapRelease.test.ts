import { describe, expect, test } from "vitest";

import {
  resolveSliderReleaseSnapForce,
  resolveSliderSkipSnaps,
} from "./snapRelease";

function createTarget(currentTarget: number, loop = false) {
  const snaps = [0, -100, -200, -300];
  const contentSize = 400;

  function minDistance(distances: number[]) {
    return distances
      .concat()
      .sort((a, b) => Math.abs(a) - Math.abs(b))[0];
  }

  function shortcut(target: number, direction: number) {
    const targets = [target, target + contentSize, target - contentSize];

    if (!loop) return target;
    if (!direction) return minDistance(targets);

    const dir = Math.sign(direction);
    const matchingTargets = targets.filter((candidate) => Math.sign(candidate) === dir);

    if (matchingTargets.length) return minDistance(matchingTargets);
    return targets[targets.length - 1] - contentSize;
  }

  function nearestIndex(target: number) {
    return snaps
      .map((snap, index) => ({ index, diff: Math.abs(shortcut(snap - target, 0)) }))
      .sort((a, b) => a.diff - b.diff)[0].index;
  }

  return {
    byIndex(index: number, direction = 0) {
      return { index, distance: shortcut(snaps[index] - currentTarget, direction) };
    },
    byDistance(distance: number) {
      const index = nearestIndex(currentTarget + distance);
      return { index, distance: shortcut(snaps[index] - currentTarget, 0) };
    },
  };
}

describe("slider skip snap options", () => {
  test("keeps boolean skipSnaps backwards compatible", () => {
    expect(resolveSliderSkipSnaps(false)).toEqual({ enabled: false, threshold: 0 });
    expect(resolveSliderSkipSnaps(true)).toEqual({ enabled: true, threshold: 0 });
  });

  test("enables object-form skipSnaps by default and clamps threshold", () => {
    expect(resolveSliderSkipSnaps({ threshold: 1.5 })).toEqual({
      enabled: true,
      threshold: 1.5,
    });
    expect(resolveSliderSkipSnaps({ enabled: false, threshold: -2 })).toEqual({
      enabled: false,
      threshold: 0,
    });
  });
});

describe("slider release snap force", () => {
  test("caps normal releases to the adjacent snap when skipSnaps is disabled", () => {
    expect(
      resolveSliderReleaseSnapForce({
        force: -260,
        slideCount: 4,
        currentIndex: 0,
        wrap: false,
        skipSnaps: false,
        scrollTarget: createTarget(0),
      })
    ).toBe(-100);
  });

  test("allows skipSnaps to target farther snaps", () => {
    expect(
      resolveSliderReleaseSnapForce({
        force: -260,
        slideCount: 4,
        currentIndex: 0,
        wrap: false,
        skipSnaps: true,
        scrollTarget: createTarget(0),
      })
    ).toBe(-300);
  });

  test("uses skipSnaps.threshold as a multiplier of adjacent snap distance", () => {
    expect(
      resolveSliderReleaseSnapForce({
        force: -160,
        slideCount: 4,
        currentIndex: 0,
        wrap: false,
        skipSnaps: { threshold: 2 },
        scrollTarget: createTarget(0),
      })
    ).toBe(-100);
  });

  test("strictSnaps resolves from the drag start index instead of the current dragged index", () => {
    expect(
      resolveSliderReleaseSnapForce({
        force: -260,
        slideCount: 4,
        currentIndex: 3,
        dragStartIndex: 0,
        wrap: false,
        skipSnaps: true,
        strictSnaps: true,
        scrollTarget: createTarget(-260),
      })
    ).toBe(160);
  });

  test("strictSnaps trusts drag displacement when release force disagrees at a loop seam", () => {
    expect(
      resolveSliderReleaseSnapForce({
        force: 1,
        fallbackDirection: -260,
        slideCount: 4,
        currentIndex: 0,
        dragStartIndex: 0,
        wrap: true,
        strictSnaps: true,
        scrollTarget: createTarget(0, true),
      })
    ).toBe(-100);
  });

  test("strictSnaps returns to the drag start when release force and displacement are zero", () => {
    expect(
      resolveSliderReleaseSnapForce({
        force: 0,
        fallbackDirection: 0,
        slideCount: 4,
        currentIndex: 3,
        dragStartIndex: 0,
        wrap: false,
        strictSnaps: true,
        scrollTarget: createTarget(-260),
      })
    ).toBe(260);
  });
});
