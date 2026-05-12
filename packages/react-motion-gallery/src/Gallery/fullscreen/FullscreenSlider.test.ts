import { describe, expect, test } from "vitest";

import {
  shouldSuppressFullscreenLoopForScroll,
  shouldStartFullscreenCrossfade,
  shouldUseFullscreenZoomedSourceSnapshot,
} from "./FullscreenSlider";
import {
  resolveCrossfadeWheelOptions,
  resolveCrossfadeWheelTarget,
  shouldTreatCrossfadeWheelAsSameSession,
} from "../shared/crossfade";
import {
  createWrappedTransform,
  normalizeFullscreenSliderGap,
  resolveFullscreenSliderGap,
} from "./transforms";
import {
  getFullscreenVideoOpenRefIndex,
  shouldPlayFullscreenVideoOnOpen,
} from "./FullscreenRuntime";

describe("fullscreen slide crossfade trigger rules", () => {
  test("allows arrow-triggered crossfades when controls crossfade is enabled", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controls: true,
        drag: false,
        showFullscreenSlider: true,
        busy: false,
        trigger: "arrow",
        hasCrossfadeSlides: true,
        fromIndex: 0,
        toIndex: 1,
      })
    ).toBe(true);
  });

  test("allows animated requestSet jumps to use the crossfade path", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controls: true,
        drag: false,
        showFullscreenSlider: true,
        busy: false,
        trigger: "requestSet",
        mode: "animated",
        hasCrossfadeSlides: true,
        fromIndex: 1,
        toIndex: 4,
      })
    ).toBe(true);
  });

  test("keeps instant requestSet jumps out of the crossfade path", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controls: true,
        drag: false,
        showFullscreenSlider: true,
        busy: false,
        trigger: "requestSet",
        mode: "instant",
        hasCrossfadeSlides: true,
        fromIndex: 1,
        toIndex: 4,
      })
    ).toBe(false);
  });

  test("allows wheel-triggered crossfades when wheel crossfade is enabled", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controls: true,
        drag: true,
        wheel: true,
        showFullscreenSlider: true,
        busy: false,
        trigger: "wheel",
        hasCrossfadeSlides: true,
        fromIndex: 1,
        toIndex: 2,
      })
    ).toBe(true);
  });

  test("allows drag fades only when drag crossfade is enabled", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controls: false,
        drag: true,
        showFullscreenSlider: true,
        busy: false,
        trigger: "drag",
        hasCrossfadeSlides: true,
        fromIndex: 1,
        toIndex: 2,
      })
    ).toBe(true);
  });

  test("blocks drag fades when drag crossfade is disabled", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controls: true,
        drag: false,
        showFullscreenSlider: true,
        busy: false,
        trigger: "drag",
        hasCrossfadeSlides: true,
        fromIndex: 1,
        toIndex: 2,
      })
    ).toBe(false);
  });

  test("shouldStartFullscreenCrossfade returns false when busy (caller cancels in-flight animation before calling)", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controls: true,
        drag: true,
        showFullscreenSlider: true,
        busy: true,
        trigger: "arrow",
        hasCrossfadeSlides: true,
        fromIndex: 1,
        toIndex: 2,
      })
    ).toBe(false);
  });
});

describe("fullscreen zoomed source snapshot rules", () => {
  test("uses a live source snapshot for zoomed arrow fades", () => {
    expect(
      shouldUseFullscreenZoomedSourceSnapshot({
        controls: true,
        trigger: "arrow",
        isZoomed: true,
      })
    ).toBe(true);
  });

  test("skips the live source snapshot for drag fades", () => {
    expect(
      shouldUseFullscreenZoomedSourceSnapshot({
        controls: true,
        trigger: "drag",
        isZoomed: true,
      })
    ).toBe(false);
  });
});

describe("fullscreen loop suppression rules", () => {
  test("does not suppress loop wrapping for no-op recenter requests", () => {
    expect(
      shouldSuppressFullscreenLoopForScroll({
        distance: 0,
        fromIndex: 0,
        toIndex: 0,
      })
    ).toBe(false);
  });

  test("suppresses loop wrapping while a real recenter motion is pending", () => {
    expect(
      shouldSuppressFullscreenLoopForScroll({
        distance: 120,
        fromIndex: 0,
        toIndex: 0,
      })
    ).toBe(true);

    expect(
      shouldSuppressFullscreenLoopForScroll({
        distance: 0,
        fromIndex: 0,
        toIndex: 1,
      })
    ).toBe(true);
  });
});

describe("fullscreen video play-on-open rules", () => {
  test("targets the original rendered slide in wrapped fullscreen tracks", () => {
    expect(
      getFullscreenVideoOpenRefIndex({
        canonicalIndex: 0,
        canonicalLength: 4,
      })
    ).toBe(1);

    expect(
      getFullscreenVideoOpenRefIndex({
        canonicalIndex: 3,
        canonicalLength: 4,
      })
    ).toBe(4);
  });

  test("targets the canonical slide in single-slide fullscreen tracks", () => {
    expect(
      getFullscreenVideoOpenRefIndex({
        canonicalIndex: 0,
        canonicalLength: 1,
      })
    ).toBe(0);
  });

  test("only attempts playback for visible fullscreen video opens", () => {
    expect(
      shouldPlayFullscreenVideoOnOpen({
        enabled: true,
        showFullscreenModal: true,
        showFullscreenSlider: true,
        closingModal: false,
        item: { kind: "video", src: "https://example.com/demo.mp4" } as any,
      })
    ).toBe(true);

    expect(
      shouldPlayFullscreenVideoOnOpen({
        enabled: true,
        showFullscreenModal: true,
        showFullscreenSlider: true,
        closingModal: false,
        item: { kind: "image", src: "https://example.com/demo.jpg" } as any,
      })
    ).toBe(false);

    expect(
      shouldPlayFullscreenVideoOnOpen({
        enabled: false,
        showFullscreenModal: true,
        showFullscreenSlider: true,
        closingModal: false,
        item: { kind: "video", src: "https://example.com/demo.mp4" } as any,
      })
    ).toBe(false);
  });
});

describe("fullscreen wheel crossfade rules", () => {
  const defaults = {
    sensitivity: 5,
    commitThreshold: 0.38,
    sessionGapMs: 24,
  };

  test("falls back to controls when wheel options are omitted", () => {
    expect(
      resolveCrossfadeWheelOptions({
        controls: true,
        sharedDurationMs: 120,
        defaults,
      }).enabled
    ).toBe(true);
  });

  test("allows wheel to disable the controls fallback", () => {
    expect(
      resolveCrossfadeWheelOptions({
        controls: true,
        wheel: false,
        sharedDurationMs: 120,
        defaults,
      }).enabled
    ).toBe(false);
  });

  test("enables wheel when an options object is provided", () => {
    expect(
      resolveCrossfadeWheelOptions({
        controls: false,
        wheel: { sensitivity: 4 },
        sharedDurationMs: 120,
        defaults,
      }).enabled
    ).toBe(true);
  });

  test("resolves wheel tuning values", () => {
    expect(
      resolveCrossfadeWheelOptions({
        controls: false,
        wheel: {
          sensitivity: 6,
          commitThreshold: 0.32,
          durationMs: 180,
          sessionGapMs: 30,
        },
        sharedDurationMs: 120,
        defaults,
      })
    ).toEqual({
      enabled: true,
      sensitivity: 6,
      commitThreshold: 0.32,
      durationMs: 180,
      sessionGapMs: 30,
    });
  });

  test("targets only the adjacent slide for forceful wheel travel", () => {
    expect(
      resolveCrossfadeWheelTarget({
        currentIndex: 1,
        delta: 900,
        slideCount: 5,
        wrap: true,
      })
    ).toBe(2);
  });

  test("absorbs same-direction wheel tail within the session gap", () => {
    expect(
      shouldTreatCrossfadeWheelAsSameSession({
        now: 20,
        direction: 1,
        sessionDirection: 1,
        lastEventTs: 0,
        sessionGapMs: 24,
      })
    ).toBe(true);
  });

  test("lets opposite-direction or post-gap wheel input start fresh", () => {
    expect(
      shouldTreatCrossfadeWheelAsSameSession({
        now: 20,
        direction: -1,
        sessionDirection: 1,
        lastEventTs: 0,
        sessionGapMs: 24,
      })
    ).toBe(false);

    expect(
      shouldTreatCrossfadeWheelAsSameSession({
        now: 40,
        direction: 1,
        sessionDirection: 1,
        lastEventTs: 0,
        sessionGapMs: 24,
      })
    ).toBe(false);
  });
});

describe("fullscreen slider gap geometry", () => {
  test("adds the gap to wrapped slide transforms", () => {
    const transform = createWrappedTransform({ length: 5, sign: 1, gap: 20 });

    expect(transform(0)).toBe("translateX(calc(-100% - 20px))");
    expect(transform(1)).toBe("translateX(0%)");
    expect(transform(2)).toBe("translateX(calc(100% + 20px))");
    expect(transform(4)).toBe("translateX(calc(300% + 60px))");
  });

  test("keeps gap direction-aware in rtl mode", () => {
    const transform = createWrappedTransform({ length: 5, sign: -1, gap: 20 });

    expect(transform(0)).toBe("translateX(calc(100% + 20px))");
    expect(transform(2)).toBe("translateX(calc(-100% - 20px))");
    expect(transform(4)).toBe("translateX(calc(-300% - 60px))");
  });

  test("normalizes invalid fullscreen gaps", () => {
    expect(normalizeFullscreenSliderGap(-12)).toBe(0);
    expect(normalizeFullscreenSliderGap(Number.NaN)).toBe(0);
    expect(normalizeFullscreenSliderGap(16)).toBe(16);
  });

  test("resolves responsive fullscreen gaps from breakpoints", () => {
    const gap = { 0: 12, md: 20, 1200: 28 };

    expect(resolveFullscreenSliderGap(gap, 600)).toBe(12);
    expect(resolveFullscreenSliderGap(gap, 900)).toBe(20);
    expect(resolveFullscreenSliderGap(gap, 1400)).toBe(28);
  });
});
