import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import SliderStyles from "../../slider/Slider.module.css";
import { sliderLoading } from "../../slider/plugins/loading";
import { createEntriesSliderMedia } from "./slider";

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
});
