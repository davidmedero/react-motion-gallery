import * as React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import EntryStyles from "../../entries/Entries.module.css";
import { EntryList } from "../../entries/components/EntryList";
import GridStyles from "../../grid/Grid.module.css";
import Grid from "../../grid/index";
import { Slider } from "../../slider/index";
import SliderStyles from "../../slider/Slider.module.css";
import ThumbnailSlider from "../../thumbnails/index";
import ThumbnailStyles from "../../thumbnails/Thumbnails.module.css";

vi.mock("../../entries/hooks/useEntryInView", () => ({
  useEntryInView: () => ({
    nearView: [true],
    everInView: [true],
    setEntryRef: () => () => undefined,
  }),
}));

vi.mock("../../entries/hooks/useEntryDecodeReady", () => ({
  useEntryDecodeReady: () => ({
    decodedReady: [true],
  }),
}));

vi.mock("../hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => false,
}));

function readCss(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("loading layer stacking", () => {
  test("uses always-above z-index values across the shared loading shells", () => {
    const sliderCss = readCss("../../slider/Slider.module.css");
    const gridCss = readCss("../../grid/Grid.module.css");
    const masonryCss = readCss("../../masonry/Masonry.module.css");
    const thumbnailCss = readCss("../../thumbnails/Thumbnails.module.css");

    expect(sliderCss).toMatch(/\.contentLayer\s*\{[^}]*z-index:\s*2;/s);
    expect(sliderCss).toMatch(/\.loadingLayer\s*\{[^}]*z-index:\s*1;/s);

    expect(gridCss).toMatch(/\.gridContentLayer\s*\{[^}]*z-index:\s*2;/s);
    expect(gridCss).toMatch(/\.gridLoadingLayer\s*\{[^}]*z-index:\s*1;/s);

    expect(masonryCss).toMatch(/\.masonryContentLayer\s*\{[^}]*z-index:\s*2;/s);
    expect(masonryCss).toMatch(/\.masonryLoadingLayer\s*\{[^}]*z-index:\s*1;/s);

    expect(thumbnailCss).toMatch(/\.thumbContentLayer\s*\{[^}]*z-index:\s*2;/s);
    expect(thumbnailCss).toMatch(/\.thumbLoadingLayer\s*\{[^}]*z-index:\s*1;/s);
  });

  test("uses slider-style shimmer vars for built-in thumbnail placeholders", () => {
    const thumbnailCss = readCss("../../thumbnails/Thumbnails.module.css");

    expect(thumbnailCss).toContain(".thumbSkeleton::after");
    expect(thumbnailCss).toContain("var(--rmg-skel-bg, #e5e5e5)");
    expect(thumbnailCss).toContain("var(--rmg-skel-shimmer-enabled, 1)");
    expect(thumbnailCss).toContain("var(--rmg-skel-shimmer-duration, 1200ms)");
    expect(thumbnailCss).toContain("var(--rmg-skel-shimmer-timing, linear)");
    expect(thumbnailCss).toContain("transform: translateX(-100%)");
    expect(thumbnailCss).toContain("transform: translateX(100%)");
    expect(thumbnailCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.thumbSkeleton::after\s*\{[^}]*animation:\s*none;/s
    );
    expect(thumbnailCss).not.toContain("--rmg-shimmer-");
  });

  test("keeps grid, slider, and thumbnails rendering both content and loading wrappers during forced loading", () => {
    const gridMarkup = renderToStaticMarkup(
      React.createElement(
        Grid,
        {
          columns: 1,
          loading: {
            force: true,
            timing: {
              exitMs: 700,
            },
          },
        },
        React.createElement("img", {
          key: "grid-image",
          src: "/alpha.jpg",
          alt: "Alpha",
        })
      )
    );

    expect(gridMarkup).toContain(GridStyles.gridContentLayer);
    expect(gridMarkup).toContain(GridStyles.gridContentBlocked);
    expect(gridMarkup).toContain(GridStyles.gridLoadingLayer);
    expect(gridMarkup).toContain('aria-hidden="true"');
    expect(gridMarkup).toContain("--rmg-loading-fade-duration:700ms");

    const sliderMarkup = renderToStaticMarkup(
      React.createElement(
        Slider,
        {
          layout: {
            cellsPerSlide: 1,
          },
          controls: {
            arrows: { enabled: false },
            dots: { enabled: false },
            progress: { enabled: false },
            scrollbar: { enabled: false },
          },
          transitions: {
            loading: {
              force: true,
              timing: {
                exitMs: 900,
              },
            },
          },
        },
        React.createElement("div", { key: "slide-1" }, "One"),
        React.createElement("div", { key: "slide-2" }, "Two")
      )
    );

    expect(sliderMarkup).toContain(SliderStyles.contentLayer);
    expect(sliderMarkup).toContain(SliderStyles.contentBlocked);
    expect(sliderMarkup).toContain(SliderStyles.loadingLayer);
    expect(sliderMarkup).toContain('aria-hidden="true"');
    expect(sliderMarkup).toContain("--rmg-loading-fade-duration:900ms");

    const thumbnailMarkup = renderToStaticMarkup(
      React.createElement(
        ThumbnailSlider,
        {
          options: {
            controls: { enabled: false },
            transitions: {
              loading: {
                force: true,
                timing: {
                  exitMs: 880,
                },
              },
            },
          },
        },
        React.createElement("button", { key: "thumb-1", type: "button" }, "Thumb One"),
        React.createElement("button", { key: "thumb-2", type: "button" }, "Thumb Two")
      )
    );

    expect(thumbnailMarkup).toContain(ThumbnailStyles.thumbContentLayer);
    expect(thumbnailMarkup).toContain(ThumbnailStyles.thumbContentBlocked);
    expect(thumbnailMarkup).toContain(ThumbnailStyles.thumbLoadingLayer);
    expect(thumbnailMarkup).toContain('aria-hidden="true"');
    expect(thumbnailMarkup).toContain("--rmg-loading-fade-duration:880ms");
  });

  test("keeps mounted entries rendering both content and skeleton wrappers in the ready overlap state", () => {
    const entriesCss = readCss("../../entries/Entries.module.css");

    expect(entriesCss).toMatch(
      /\.entryRow\[data-rmg-entry-mounted="1"\]\s+\.entrySkeletonWrap\s*\{[^}]*z-index:\s*0;/s
    );
    expect(entriesCss).toMatch(/\.entryInner\s*\{[^}]*z-index:\s*1;/s);

    const markup = renderToStaticMarkup(
      React.createElement(EntryList, {
        enabled: true,
        entries: {
          items: [
            {
              media: [
                {
                  kind: "image",
                  src: "/entry-alpha.jpg",
                  alt: "Entry Alpha",
                },
              ],
            },
          ],
          loading: {
            enabled: true,
          },
        },
        fsEnabled: false,
        openFullscreenAt: () => undefined,
        entryFlatIndexRef: React.createRef<number[][] | null>(),
        nodeFromMedia: (media) =>
          React.createElement("img", {
            src: (media as any).src,
            alt: (media as any).alt ?? "",
          }),
        renderMediaContainer: ({ mediaNodes }) =>
          React.createElement("div", null, mediaNodes),
      })
    );

    expect(markup).toContain('data-rmg-entry-ready="1"');
    expect(markup).toContain('data-rmg-entry-mounted="1"');
    expect(markup).toContain(EntryStyles.entrySkeletonWrap);
    expect(markup).toContain(EntryStyles.entryInner);
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('alt="Entry Alpha"');
  });
});
