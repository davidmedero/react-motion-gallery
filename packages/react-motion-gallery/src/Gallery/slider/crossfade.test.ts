import { describe, expect, test } from "vitest";

import {
  resolveSliderCrossfadeDragTarget,
  resolveSliderWheelCrossfadeOptions,
  resolveSliderWheelCrossfadeProgress,
  resolveSliderWheelCrossfadeTarget,
  shouldCompleteSliderDragCrossfade,
  shouldCompleteSliderWheelCrossfade,
  shouldTreatSliderWheelAsSameSession,
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

describe("slider wheel crossfade options", () => {
  const defaults = {
    sensitivity: 5,
    commitThreshold: 0.38,
    sessionGapMs: 24,
  };

  test("falls back to controls when wheel options are omitted", () => {
    expect(
      resolveSliderWheelCrossfadeOptions({
        controls: true,
        sharedDurationMs: 420,
        defaults,
      }).enabled
    ).toBe(true);
  });

  test("allows wheel to disable the controls fallback", () => {
    expect(
      resolveSliderWheelCrossfadeOptions({
        controls: true,
        wheel: false,
        sharedDurationMs: 420,
        defaults,
      }).enabled
    ).toBe(false);
  });

  test("enables wheel when an options object is provided", () => {
    expect(
      resolveSliderWheelCrossfadeOptions({
        controls: false,
        wheel: { sensitivity: 4 },
        sharedDurationMs: 420,
        defaults,
      }).enabled
    ).toBe(true);
  });

  test("resolves wheel tuning values and clamps unsafe ranges", () => {
    expect(
      resolveSliderWheelCrossfadeOptions({
        controls: false,
        wheel: {
          sensitivity: -2,
          commitThreshold: 0.8,
          durationMs: -10,
          sessionGapMs: -4,
        },
        sharedDurationMs: 420,
        defaults,
      })
    ).toEqual({
      enabled: true,
      sensitivity: 0,
      commitThreshold: 0.499,
      durationMs: 0,
      sessionGapMs: 0,
    });
  });
});

describe("slider wheel crossfade gesture rules", () => {
  test("targets the next slide on positive wheel travel", () => {
    expect(
      resolveSliderWheelCrossfadeTarget({
        currentIndex: 1,
        delta: 32,
        slideCount: 5,
        wrap: false,
      })
    ).toBe(2);
  });

  test("targets the previous slide on negative wheel travel", () => {
    expect(
      resolveSliderWheelCrossfadeTarget({
        currentIndex: 3,
        delta: -32,
        slideCount: 5,
        wrap: false,
      })
    ).toBe(2);
  });

  test("stays on the source slide while wheel travel is effectively zero", () => {
    expect(
      resolveSliderWheelCrossfadeTarget({
        currentIndex: 1,
        delta: 0.25,
        slideCount: 5,
        wrap: false,
      })
    ).toBe(1);
  });

  test("stops at the edge when looping is disabled", () => {
    expect(
      resolveSliderWheelCrossfadeTarget({
        currentIndex: 0,
        delta: -32,
        slideCount: 5,
        wrap: false,
      })
    ).toBe(0);
  });

  test("wraps at the edge when looping is enabled", () => {
    expect(
      resolveSliderWheelCrossfadeTarget({
        currentIndex: 0,
        delta: -32,
        slideCount: 5,
        wrap: true,
      })
    ).toBe(4);
  });

  test("maps accumulated wheel travel to direct crossfade progress", () => {
    expect(
      resolveSliderWheelCrossfadeProgress({
        delta: 120,
        distance: 600,
      })
    ).toBe(0.2);
  });

  test("caps wheel crossfade progress at one", () => {
    expect(
      resolveSliderWheelCrossfadeProgress({
        delta: 900,
        distance: 600,
      })
    ).toBe(1);
  });

  test("commits wheel crossfade below the drag halfway mark", () => {
    expect(
      shouldCompleteSliderWheelCrossfade({
        progress: 0.38,
        threshold: 0.38,
      })
    ).toBe(true);
  });

  test("keeps wheel crossfade in-between below the commit threshold", () => {
    expect(
      shouldCompleteSliderWheelCrossfade({
        progress: 0.3,
        threshold: 0.38,
      })
    ).toBe(false);
  });

  test("treats same-direction post-commit wheel input as the same session", () => {
    expect(
      shouldTreatSliderWheelAsSameSession({
        now: 40,
        direction: 1,
        sessionDirection: 1,
        lastEventTs: 0,
        sessionGapMs: 80,
      })
    ).toBe(true);
  });

  test("treats forceful same-direction momentum before a gap as the same session", () => {
    expect(
      shouldTreatSliderWheelAsSameSession({
        now: 40,
        direction: 1,
        sessionDirection: 1,
        lastEventTs: 0,
        sessionGapMs: 80,
      })
    ).toBe(true);
  });

  test("lets opposite-direction wheel input start a fresh gesture", () => {
    expect(
      shouldTreatSliderWheelAsSameSession({
        now: 40,
        direction: -1,
        sessionDirection: 1,
        lastEventTs: 0,
        sessionGapMs: 80,
      })
    ).toBe(false);
  });

  test("lets same-direction wheel input start fresh after the session gap", () => {
    expect(
      shouldTreatSliderWheelAsSameSession({
        now: 100,
        direction: 1,
        sessionDirection: 1,
        lastEventTs: 0,
        sessionGapMs: 80,
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
