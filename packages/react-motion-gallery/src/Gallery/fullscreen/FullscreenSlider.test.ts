import { describe, expect, test } from "vitest";

import {
  shouldStartFullscreenCrossfade,
  shouldUseFullscreenZoomedSourceSnapshot,
} from "./FullscreenSlider";

describe("fullscreen slide crossfade trigger rules", () => {
  test("allows arrow-triggered crossfades when controlsFade is enabled", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controlsFade: true,
        dragFade: false,
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
        controlsFade: true,
        dragFade: false,
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
        controlsFade: true,
        dragFade: false,
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

  test("keeps wheel navigation out of the crossfade path", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controlsFade: true,
        dragFade: true,
        showFullscreenSlider: true,
        busy: false,
        trigger: "wheel",
        hasCrossfadeSlides: true,
        fromIndex: 1,
        toIndex: 2,
      })
    ).toBe(false);
  });

  test("allows drag fades only when dragFade is enabled", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controlsFade: false,
        dragFade: true,
        showFullscreenSlider: true,
        busy: false,
        trigger: "drag",
        hasCrossfadeSlides: true,
        fromIndex: 1,
        toIndex: 2,
      })
    ).toBe(true);
  });

  test("blocks drag fades when dragFade is disabled", () => {
    expect(
      shouldStartFullscreenCrossfade({
        controlsFade: true,
        dragFade: false,
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
        controlsFade: true,
        dragFade: true,
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
        controlsFade: true,
        trigger: "arrow",
        isZoomed: true,
      })
    ).toBe(true);
  });

  test("skips the live source snapshot for drag fades", () => {
    expect(
      shouldUseFullscreenZoomedSourceSnapshot({
        controlsFade: true,
        trigger: "drag",
        isZoomed: true,
      })
    ).toBe(false);
  });
});
