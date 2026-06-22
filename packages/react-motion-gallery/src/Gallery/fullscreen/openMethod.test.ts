import { describe, expect, test } from "vitest";

import { resolveFullscreenControllerOpenMethod } from "./openMethod";

describe("resolveFullscreenControllerOpenMethod", () => {
  test("forces fade when transitionFade is enabled", () => {
    expect(
      resolveFullscreenControllerOpenMethod(
        { kind: "image", src: "/image.jpg", alt: "Image" },
        undefined,
        true
      )
    ).toBe("fade");
  });

  test("preserves explicit fade requests", () => {
    expect(
      resolveFullscreenControllerOpenMethod(
        { kind: "image", src: "/image.jpg", alt: "Image" },
        "fade",
        false
      )
    ).toBe("fade");
  });

  test("defaults images to scale without transitionFade", () => {
    expect(
      resolveFullscreenControllerOpenMethod(
        { kind: "image", src: "/image.jpg", alt: "Image" },
        undefined,
        false
      )
    ).toBe("scale");
  });

  test("defaults non-images to fade without transitionFade", () => {
    expect(
      resolveFullscreenControllerOpenMethod(
        { kind: "video", src: "/video.mp4" },
        undefined,
        false
      )
    ).toBe("fade");
  });
});
