import { describe, expect, test } from "vitest";

import {
  resolveCrossfadeDragTarget,
  shouldCompleteCrossfadeDrag,
} from "./crossfade";

describe("shared crossfade drag targeting", () => {
  test("negative drag deltas advance to the next slide", () => {
    expect(
      resolveCrossfadeDragTarget({
        currentIndex: 1,
        delta: -120,
        slideCount: 5,
        wrap: false,
      })
    ).toBe(2);
  });

  test("positive drag deltas move to the previous slide", () => {
    expect(
      resolveCrossfadeDragTarget({
        currentIndex: 3,
        delta: 120,
        slideCount: 5,
        wrap: false,
      })
    ).toBe(2);
  });

  test("wraps across the seam when looping is enabled", () => {
    expect(
      resolveCrossfadeDragTarget({
        currentIndex: 0,
        delta: 120,
        slideCount: 5,
        wrap: true,
      })
    ).toBe(4);
  });
});

describe("shared crossfade drag release rules", () => {
  test("completes when the drag crosses the halfway mark", () => {
    expect(
      shouldCompleteCrossfadeDrag({
        progress: 0.51,
        force: 0,
        delta: -80,
      })
    ).toBe(true);
  });

  test("completes with a matching flick even before halfway", () => {
    expect(
      shouldCompleteCrossfadeDrag({
        progress: 0.2,
        force: -0.2,
        delta: -80,
      })
    ).toBe(true);
  });

  test("cancels when the progress is low and the flick opposes the drag", () => {
    expect(
      shouldCompleteCrossfadeDrag({
        progress: 0.2,
        force: 0.2,
        delta: -80,
      })
    ).toBe(false);
  });
});
