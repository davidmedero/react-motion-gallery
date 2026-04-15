import { describe, expect, test } from "vitest";

import {
  resolveSliderCrossfadeDragTarget,
  shouldCompleteSliderDragCrossfade,
  shouldStartSliderControlsCrossfade,
} from "./crossfade";

describe("slider controls crossfade rules", () => {
  test("starts when controls crossfade is enabled and the target changes", () => {
    expect(
      shouldStartSliderControlsCrossfade({
        enabled: true,
        busy: false,
        fromIndex: 0,
        toIndex: 1,
      })
    ).toBe(true);
  });

  test("stays disabled while a crossfade is already running", () => {
    expect(
      shouldStartSliderControlsCrossfade({
        enabled: true,
        busy: true,
        fromIndex: 0,
        toIndex: 1,
      })
    ).toBe(false);
  });

  test("does not start when the target matches the current slide", () => {
    expect(
      shouldStartSliderControlsCrossfade({
        enabled: true,
        busy: false,
        fromIndex: 2,
        toIndex: 2,
      })
    ).toBe(false);
  });
});

describe("slider drag crossfade targeting", () => {
  test("negative drag deltas advance to the next slide", () => {
    expect(
      resolveSliderCrossfadeDragTarget({
        currentIndex: 1,
        delta: -120,
        slideCount: 5,
        wrap: false,
      })
    ).toBe(2);
  });

  test("positive drag deltas move to the previous slide", () => {
    expect(
      resolveSliderCrossfadeDragTarget({
        currentIndex: 3,
        delta: 120,
        slideCount: 5,
        wrap: false,
      })
    ).toBe(2);
  });

  test("wraps across the seam when looping is enabled", () => {
    expect(
      resolveSliderCrossfadeDragTarget({
        currentIndex: 0,
        delta: 120,
        slideCount: 5,
        wrap: true,
      })
    ).toBe(4);
  });
});

describe("slider drag crossfade release rules", () => {
  test("completes when the drag crosses the halfway mark", () => {
    expect(
      shouldCompleteSliderDragCrossfade({
        progress: 0.51,
        force: 0,
        delta: -80,
      })
    ).toBe(true);
  });

  test("completes with a matching flick even before halfway", () => {
    expect(
      shouldCompleteSliderDragCrossfade({
        progress: 0.2,
        force: -0.2,
        delta: -80,
      })
    ).toBe(true);
  });

  test("cancels when the progress is low and the flick opposes the drag", () => {
    expect(
      shouldCompleteSliderDragCrossfade({
        progress: 0.2,
        force: 0.2,
        delta: -80,
      })
    ).toBe(false);
  });
});
