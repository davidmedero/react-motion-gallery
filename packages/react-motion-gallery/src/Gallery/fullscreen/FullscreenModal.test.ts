import { describe, expect, test } from "vitest";

import {
  resolveCenteredScrollTop,
  resolveCloseShieldReleaseMs,
  shouldUseFadeClose,
} from "./FullscreenModal";

describe("shouldUseFadeClose", () => {
  test("keeps a fade-opened item on the fade close path even when a transform target is available", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "fade",
        isLatchedIntroIndex: true,
        hasTransformTarget: true,
      })
    ).toBe(true);
  });

  test("uses the transform close path for a fade-opened image after navigating to a different transform target", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "fade",
        isLatchedIntroIndex: false,
        hasTransformTarget: true,
      })
    ).toBe(false);
  });

  test("keeps fade-opened images on the fade close path when there is no transform target", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "fade",
        isLatchedIntroIndex: false,
        hasTransformTarget: false,
      })
    ).toBe(true);
  });

  test("keeps scale-opened images on the scale close path", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "scale",
        isLatchedIntroIndex: true,
        hasTransformTarget: true,
      })
    ).toBe(false);
  });

  test("uses fade close for introFade and video slides", () => {
    expect(
      shouldUseFadeClose({
        introFade: true,
        isVideoSlide: false,
        introMethod: "scale",
        isLatchedIntroIndex: false,
        hasTransformTarget: true,
      })
    ).toBe(true);

    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: true,
        introMethod: "scale",
        isLatchedIntroIndex: false,
        hasTransformTarget: true,
      })
    ).toBe(true);
  });
});

describe("resolveCloseShieldReleaseMs", () => {
  test("uses a short click-swallow window instead of the full fade duration", () => {
    expect(resolveCloseShieldReleaseMs(300)).toBe(80);
    expect(resolveCloseShieldReleaseMs(560)).toBe(80);
  });

  test("does not extend shorter or disabled close durations", () => {
    expect(resolveCloseShieldReleaseMs(40)).toBe(40);
    expect(resolveCloseShieldReleaseMs(0)).toBe(0);
  });
});

describe("resolveCenteredScrollTop", () => {
  test("centers a target in the visual viewport", () => {
    expect(
      resolveCenteredScrollTop({
        rectTop: 900,
        rectHeight: 200,
        scrollY: 1200,
        viewportHeight: 800,
        viewportOffsetTop: 0,
        maxScrollY: 5000,
      })
    ).toBe(1800);
  });

  test("subtracts visual viewport offset before centering on mobile", () => {
    expect(
      resolveCenteredScrollTop({
        rectTop: 900,
        rectHeight: 200,
        scrollY: 1200,
        viewportHeight: 700,
        viewportOffsetTop: 80,
        maxScrollY: 5000,
      })
    ).toBe(1770);
  });

  test("clamps bottom-of-page targets to the maximum scroll position", () => {
    expect(
      resolveCenteredScrollTop({
        rectTop: 4155.796875,
        rectHeight: 316.75,
        scrollY: 0,
        viewportHeight: 1100,
        maxScrollY: 3339,
      })
    ).toBe(3339);
  });
});
