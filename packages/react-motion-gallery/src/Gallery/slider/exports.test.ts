import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

import * as sliderEntry from "../../slider";
import * as sliderReadyEntry from "../../slider-ready";
import * as sliderArrowsEntry from "../../slider-arrows";
import * as sliderDotsEntry from "../../slider-dots";
import * as sliderProgressEntry from "../../slider-progress";
import * as sliderScrollbarEntry from "../../slider-scrollbar";
import * as sliderRippleEntry from "../../slider-ripple";
import * as sliderAutoPlayEntry from "../../slider-auto-play";
import * as sliderAutoScrollEntry from "../../slider-auto-scroll";
import * as sliderAutoHeightEntry from "../../slider-auto-height";
import * as sliderLazyLoadEntry from "../../slider-lazy-load";
import * as sliderParallaxEntry from "../../slider-parallax";
import * as sliderScaleEntry from "../../slider-scale";
import * as sliderFadeEntry from "../../slider-fade";
import * as sliderCrossfadeEntry from "../../slider-crossfade";
import * as sliderFullscreenEntry from "../../slider-fullscreen";
import * as sliderLoadingEntry from "../../slider-loading";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("slider public entries", () => {
  test("exports the slim slider from the default slider subpath", () => {
    expect(sliderEntry.Slider).toBeDefined();
    expect(sliderEntry.default).toBe(sliderEntry.Slider);
    expect(sliderEntry.createSliderIndexChannel).toBeTypeOf("function");
    expect(sliderEntry.useSliderReady).toBeTypeOf("function");
  });

  test("exports slider readiness as a dedicated subpath", () => {
    expect(packageJson.exports["./slider/ready"]).toBeDefined();
    expect(sliderReadyEntry.useSliderReady).toBe(sliderEntry.useSliderReady);
  });

  test("removes the old coarse slider preset package exports", () => {
    expect(packageJson.exports["./slider/rich"]).toBeUndefined();
    expect(packageJson.exports["./slider/full"]).toBeUndefined();
    expect(packageJson.exports["./slider/skeleton"]).toBeUndefined();
    expect(packageJson.exports["./slider/restore"]).toBeUndefined();
  });

  test("exports granular first-party slider plugins", () => {
    const entries = [
      ["./slider/arrows", sliderArrowsEntry.sliderArrows],
      ["./slider/dots", sliderDotsEntry.sliderDots],
      ["./slider/progress", sliderProgressEntry.sliderProgress],
      ["./slider/scrollbar", sliderScrollbarEntry.sliderScrollbar],
      ["./slider/ripple", sliderRippleEntry.sliderRipple],
      ["./slider/auto-play", sliderAutoPlayEntry.sliderAutoPlay],
      ["./slider/auto-scroll", sliderAutoScrollEntry.sliderAutoScroll],
      ["./slider/auto-height", sliderAutoHeightEntry.sliderAutoHeight],
      ["./slider/lazy-load", sliderLazyLoadEntry.sliderLazyLoad],
      ["./slider/parallax", sliderParallaxEntry.sliderParallax],
      ["./slider/scale", sliderScaleEntry.sliderScale],
      ["./slider/fade", sliderFadeEntry.sliderFade],
      ["./slider/crossfade", sliderCrossfadeEntry.sliderCrossfade],
      ["./slider/fullscreen", sliderFullscreenEntry.sliderFullscreen],
      ["./slider/loading", sliderLoadingEntry.sliderLoading],
    ] as const;

    for (const [subpath, factory] of entries) {
      expect(packageJson.exports[subpath]).toBeDefined();
      expect(factory).toBeTypeOf("function");
      expect(factory()).toMatchObject({ __rmgSliderPlugin: true });
    }
  });
});
