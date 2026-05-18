import { describe, expect, test } from "vitest";

import {
  DEFAULT_FULLSCREEN_INTRO_FADE_DURATION_MS,
  DEFAULT_FULLSCREEN_INTRO_TRANSFORM_DURATION_MS,
  DEFAULT_FULLSCREEN_INTRO_EASING,
  mergeFullscreenIntroPathTiming,
  resolveFullscreenIntroDurationMs,
  resolveFullscreenIntroEasing,
} from "./introTiming";

describe("fullscreen intro path timing", () => {
  test("defaults transform and fade duration independently", () => {
    expect(resolveFullscreenIntroDurationMs(undefined, "transform")).toBe(
      DEFAULT_FULLSCREEN_INTRO_TRANSFORM_DURATION_MS
    );
    expect(resolveFullscreenIntroDurationMs(undefined, "fade")).toBe(
      DEFAULT_FULLSCREEN_INTRO_FADE_DURATION_MS
    );
  });

  test("treats scalar duration and easing as both transform and fade timing", () => {
    expect(resolveFullscreenIntroDurationMs(500, "transform")).toBe(500);
    expect(resolveFullscreenIntroDurationMs(500, "fade")).toBe(500);
    expect(resolveFullscreenIntroEasing("linear", "transform")).toBe("linear");
    expect(resolveFullscreenIntroEasing("linear", "fade")).toBe("linear");
  });

  test("resolves transform and fade object values independently", () => {
    expect(
      resolveFullscreenIntroDurationMs({ transform: 520, fade: 180 }, "transform")
    ).toBe(520);
    expect(
      resolveFullscreenIntroDurationMs({ transform: 520, fade: 180 }, "fade")
    ).toBe(180);
    expect(
      resolveFullscreenIntroEasing(
        { transform: "ease-out", fade: "linear" },
        "transform"
      )
    ).toBe("ease-out");
    expect(
      resolveFullscreenIntroEasing(
        { transform: "ease-out", fade: "linear" },
        "fade"
      )
    ).toBe("linear");
  });

  test("falls back per missing object key", () => {
    expect(resolveFullscreenIntroDurationMs({ transform: 480 }, "fade")).toBe(
      DEFAULT_FULLSCREEN_INTRO_FADE_DURATION_MS
    );
    expect(resolveFullscreenIntroDurationMs({ fade: 480 }, "transform")).toBe(
      DEFAULT_FULLSCREEN_INTRO_TRANSFORM_DURATION_MS
    );
    expect(resolveFullscreenIntroEasing({ fade: "linear" }, "transform")).toBe(
      DEFAULT_FULLSCREEN_INTRO_EASING
    );
  });

  test("merges timing objects but lets scalar layers replace both paths", () => {
    expect(
      mergeFullscreenIntroPathTiming(
        { transform: 500 },
        { fade: 220 }
      )
    ).toEqual({ transform: 500, fade: 220 });

    expect(
      mergeFullscreenIntroPathTiming(
        { transform: 500, fade: 220 },
        360
      )
    ).toBe(360);
  });
});
