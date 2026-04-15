import { describe, expect, test } from "vitest";

import {
  buildFullscreenCaptionZoomMotion,
  DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_DURATION_MS,
  DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_EASING,
  resolveFullscreenCaptionZoomSettings,
} from "./captionZoomMotion";

describe("fullscreen caption zoom motion", () => {
  test("resolves the documented default zoom-fade settings", () => {
    expect(resolveFullscreenCaptionZoomSettings(undefined)).toEqual({
      enabled: true,
      durationMs: DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_DURATION_MS,
      easing: DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_EASING,
      zoomInTransform: "",
      zoomOutTransform: "",
    });
  });

  test("uses opacity-only motion by default", () => {
    const settings = resolveFullscreenCaptionZoomSettings(undefined);

    expect(
      buildFullscreenCaptionZoomMotion({
        phase: "hiding",
        isZoomed: true,
        settings,
      }).contentStyle.transform
    ).toBe("");

    expect(
      buildFullscreenCaptionZoomMotion({
        phase: "showingStart",
        isZoomed: false,
        settings,
      }).contentStyle.transform
    ).toBe("");
  });

  test("applies directional transforms only for their matching zoom direction", () => {
    const settings = resolveFullscreenCaptionZoomSettings({
      zoomInTransform: "translateY(18px)",
      zoomOutTransform: "translateY(-12px)",
    });

    expect(
      buildFullscreenCaptionZoomMotion({
        phase: "hiding",
        isZoomed: true,
        settings,
      }).contentStyle.transform
    ).toBe("translateY(18px)");

    expect(
      buildFullscreenCaptionZoomMotion({
        phase: "hidden",
        isZoomed: true,
        settings,
      }).contentStyle.transform
    ).toBe("translateY(18px)");

    expect(
      buildFullscreenCaptionZoomMotion({
        phase: "showingStart",
        isZoomed: false,
        settings,
      }).contentStyle.transform
    ).toBe("translateY(-12px)");

    expect(
      buildFullscreenCaptionZoomMotion({
        phase: "showing",
        isZoomed: false,
        settings,
      }).contentStyle.transform
    ).toBe("");
  });

  test("keeps captions interactive when zoom fades are disabled", () => {
    const settings = resolveFullscreenCaptionZoomSettings({
      zoomFade: false,
      zoomInTransform: "translateY(18px)",
      zoomOutTransform: "translateY(-12px)",
    });

    expect(
      buildFullscreenCaptionZoomMotion({
        phase: "hidden",
        isZoomed: true,
        settings,
      })
    ).toEqual({
      phase: "visible",
      isZoomed: true,
      interactive: true,
      contentStyle: {},
    });
  });
});
