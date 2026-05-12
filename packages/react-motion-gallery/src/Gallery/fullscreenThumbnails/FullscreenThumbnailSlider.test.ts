import { describe, expect, test } from "vitest";

import { resolveFullscreenThumbnailClosedTransform } from "./FullscreenThumbnailSlider";

describe("fullscreen thumbnail slider motion", () => {
  test("uses position-aware closed transforms", () => {
    expect(resolveFullscreenThumbnailClosedTransform("left")).toBe(
      "translateX(-8px)"
    );
    expect(resolveFullscreenThumbnailClosedTransform("right")).toBe(
      "translateX(8px)"
    );
    expect(resolveFullscreenThumbnailClosedTransform("top")).toBe(
      "translateY(-8px)"
    );
    expect(resolveFullscreenThumbnailClosedTransform("bottom")).toBe(
      "translateY(8px)"
    );
  });
});
