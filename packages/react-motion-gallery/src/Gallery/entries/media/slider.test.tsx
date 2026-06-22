import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import SliderStyles from "../../slider/Slider.module.css";
import { sliderLoading } from "../../slider/plugins/loading";
import {
  createEntriesSliderMedia,
  shouldHydrateSliderMediaIndex,
} from "./slider";

describe("createEntriesSliderMedia", () => {
  test("disables nested slider loading by default", () => {
    const renderMediaContainer = createEntriesSliderMedia();
    const markup = renderToStaticMarkup(
      renderMediaContainer({
        entryIndex: 0,
        mediaNodes: [
          React.createElement("img", {
            key: "image-1",
            src: "/entry-image.jpg",
            alt: "Entry image",
          }),
        ],
        entrySliderRefs: { current: [] },
      })
    );

    expect(markup).not.toContain(SliderStyles.loadingLayer);
  });

  test("lets callers opt the nested slider loading layer back in", () => {
    const renderMediaContainer = createEntriesSliderMedia({
      sliderObject: {
        plugins: [
          sliderLoading({
            renderLoading: () => React.createElement("span", null, "Loading"),
          }),
        ],
      },
    });
    const markup = renderToStaticMarkup(
      renderMediaContainer({
        entryIndex: 0,
        mediaNodes: [
          React.createElement("img", {
            key: "image-1",
            src: "/entry-image.jpg",
            alt: "Entry image",
          }),
        ],
        entrySliderRefs: { current: [] },
      })
    );

    expect(markup).toContain(SliderStyles.loadingLayer);
  });

  test("windows large media sliders around visible cells", () => {
    const context = {
      activeIndex: 10,
      visibleIndices: [10, 11, 12],
      count: 40,
      enabled: true,
      loop: false,
      overscan: 2,
      minItems: 12,
    };

    expect(shouldHydrateSliderMediaIndex(8, context)).toBe(true);
    expect(shouldHydrateSliderMediaIndex(14, context)).toBe(true);
    expect(shouldHydrateSliderMediaIndex(15, context)).toBe(false);
  });

  test("wraps media windows for looping sliders", () => {
    const context = {
      activeIndex: 0,
      visibleIndices: [0],
      count: 20,
      enabled: true,
      loop: true,
      overscan: 2,
      minItems: 12,
    };

    expect(shouldHydrateSliderMediaIndex(19, context)).toBe(true);
    expect(shouldHydrateSliderMediaIndex(18, context)).toBe(true);
    expect(shouldHydrateSliderMediaIndex(17, context)).toBe(false);
  });
});
