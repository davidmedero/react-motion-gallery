// @vitest-environment jsdom

import { describe, expect, test } from "vitest";

import {
  BASE_VISIBLE_IO_THRESHOLD,
  resolveSliderFullscreenClick,
  shouldNotifyBaseVisibleEntry,
} from "./fullscreen";

function createSlide({
  index,
  clone,
}: {
  index: number;
  clone: boolean;
}) {
  const slide = document.createElement("div");
  slide.setAttribute("data-rmg-slide", "true");
  slide.setAttribute("data-rmg-idx", String(index));
  slide.setAttribute("data-rmg-clone", clone ? "true" : "false");

  const image = document.createElement("img");
  image.alt = "";
  image.src = "https://example.com/slide.jpg";
  slide.append(image);
  document.body.append(slide);

  return { slide, image };
}

describe("slider fullscreen click resolution", () => {
  test("opens cloned loop slides at their canonical fullscreen index", () => {
    const { image } = createSlide({ index: 0, clone: true });

    const request = resolveSliderFullscreenClick(image);

    expect(request).toEqual({ index: 0, image });
  });
});

describe("slider fullscreen base visibility", () => {
  test("uses the lazy-load IO threshold before preloading fullscreen media", () => {
    expect(
      shouldNotifyBaseVisibleEntry({
        isIntersecting: true,
        intersectionRatio: BASE_VISIBLE_IO_THRESHOLD - 0.01,
      })
    ).toBe(false);

    expect(
      shouldNotifyBaseVisibleEntry({
        isIntersecting: true,
        intersectionRatio: BASE_VISIBLE_IO_THRESHOLD,
      })
    ).toBe(true);
  });
});
