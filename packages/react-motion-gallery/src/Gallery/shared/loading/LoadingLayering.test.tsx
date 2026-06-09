// @vitest-environment jsdom

import * as React from "react";
import { readFileSync } from "node:fs";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, test, vi } from "vitest";

import EntryStyles from "../../entries/Entries.module.css";
import {
  EntryList,
  resolveEntryLoadingVisualState,
} from "../../entries/components/EntryList";
import ThumbnailSlider, {
  resolveThumbnailLoadingVisualState,
} from "../../thumbnails/index";
import ThumbnailStyles from "../../thumbnails/Thumbnails.module.css";
import { SkeletonFrame } from "../../skeleton/base";
import { resolveCompareLoadingLayerStyle } from "./force";
import { useSkeletonRevealGate } from "./skeletonRevealGate";

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

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 0),
  );
  vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
    window.clearTimeout(handle),
  );
});

function readCss(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function entryListElement(
  force?: any,
  renderMediaContainer: (args: {
    entryInView?: boolean;
    mediaNodes: React.ReactNode[];
  }) => React.ReactNode = ({ mediaNodes }) =>
    React.createElement("div", null, mediaNodes),
) {
  return React.createElement(EntryList, {
    enabled: true,
    entries: {
      items: [
        {
          key: "entry-alpha",
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
        force,
      },
    },
    fsEnabled: false,
    openFullscreenAt: () => undefined,
    entryFlatIndex: [[0]],
    entryFlatIndexRef: React.createRef<number[][] | null>(),
    nodeFromMedia: (media: any) =>
      React.createElement("img", {
        src: media.src,
        alt: media.alt ?? "",
      }),
    renderMediaContainer,
    breakpoints: {},
  });
}

async function flushAnimationFrames(count: number) {
  await React.act(async () => {
    await new Promise<void>((resolve) => {
      const step = (remaining: number) => {
        if (remaining <= 0) {
          resolve();
          return;
        }

        requestAnimationFrame(() => step(remaining - 1));
      };

      step(count);
    });
  });
}

async function flushEntryContentPaintFrames() {
  await flushAnimationFrames(2);
}

async function flushMicrotasks() {
  await React.act(async () => {
    await Promise.resolve();
  });
}

async function flushEntryRevealFrames() {
  await flushEntryContentPaintFrames();
  await flushMicrotasks();
  await flushAnimationFrames(2);
  await flushMicrotasks();
  await flushAnimationFrames(2);
}

function dispatchOpacityTransitionEnd(node: Element) {
  const event = new Event("transitionend", { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: "opacity" });
  node.dispatchEvent(event);
}

function SkeletonRevealGateProbe() {
  const gate = useSkeletonRevealGate();
  const label = gate == null ? "none" : gate ? "unlocked" : "locked";
  return <div data-skeleton-reveal-gate={label} />;
}

describe("loading layer stacking", () => {
  test("keeps compare helpers consistent across thumbnails and entries", () => {
    expect(
      resolveThumbnailLoadingVisualState({
        loadingActive: true,
        loadingForced: {
          showContent: true,
          skeletonOpacity: 0.35,
        },
        contentReady: true,
      }),
    ).toEqual({
      compareMode: true,
      contentBlocked: false,
      loadingLayerOpacity: 0.35,
    });

    expect(
      resolveEntryLoadingVisualState({
        loadingActive: true,
        loadingForced: {
          showContent: true,
          skeletonOpacity: 0.4,
        },
        shouldMountContent: true,
        contentReady: true,
        defaultReveal: false,
      }),
    ).toEqual({
      compareMode: true,
      revealContent: true,
      loadingLayerOpacity: 0.4,
    });
  });

  test("only writes opacity vars inline when a non-default loading layer opacity is needed", () => {
    expect(
      resolveCompareLoadingLayerStyle({
        exitMs: 600,
        compareMode: false,
        loadingLayerOpacity: 1,
        opacityVarName: "--example-loading-opacity",
      }),
    ).toEqual({
      "--rmg-loading-fade-duration": "600ms",
      "--rmg-loading-fade-enter-duration": "600ms",
      "--rmg-loading-fade-exit-duration": "600ms",
    });

    expect(
      resolveCompareLoadingLayerStyle({
        enterMs: 280,
        exitMs: 600,
        compareMode: true,
        loadingLayerOpacity: 0.35,
        opacityVarName: "--example-loading-opacity",
      }),
    ).toEqual({
      "--rmg-loading-fade-duration": "600ms",
      "--rmg-loading-fade-enter-duration": "280ms",
      "--rmg-loading-fade-exit-duration": "600ms",
      "--example-loading-opacity": 0.35,
    });

    expect(
      resolveCompareLoadingLayerStyle({
        exitMs: 600,
        compareMode: false,
        loadingLayerOpacity: 1,
        opacityVarName: "--example-loading-opacity",
        hidden: true,
      }),
    ).toEqual({
      "--rmg-loading-fade-duration": "600ms",
      "--rmg-loading-fade-enter-duration": "600ms",
      "--rmg-loading-fade-exit-duration": "600ms",
      "--example-loading-opacity": 0,
    });
  });

  test("uses always-above z-index values across the shared loading shells", () => {
    const skeletonCss = readCss("../../skeleton/Skeleton.module.css");
    const thumbnailCss = readCss("../../thumbnails/Thumbnails.module.css");

    expect(skeletonCss).toMatch(/\.contentLayer\s*\{[^}]*z-index:\s*2;/s);
    expect(skeletonCss).toMatch(/\.loadingLayer\s*\{[^}]*z-index:\s*1;/s);
    expect(skeletonCss).toMatch(
      /\.loadingLayerOverlay\s*\{[^}]*overflow:\s*visible;/s,
    );

    expect(thumbnailCss).toMatch(/\.thumbContentLayer\s*\{[^}]*z-index:\s*2;/s);
    expect(thumbnailCss).toMatch(/\.thumbLoadingLayer\s*\{[^}]*z-index:\s*1;/s);
    expect(skeletonCss).toMatch(
      /\.loadingLayerCompare\s*\{[^}]*z-index:\s*3;/s,
    );
    expect(thumbnailCss).toMatch(
      /\.thumbLoadingLayerCompare\s*\{[^}]*z-index:\s*3;/s,
    );
  });

  test("keeps reveal opacity transitions on the pre-active state for Safari", () => {
    const gridCss = readCss("../../grid/Grid.module.css");
    const masonryCss = readCss("../../masonry/Masonry.module.css");
    const sliderCss = readCss("../../slider/Slider.module.css");

    expect(gridCss).toMatch(
      /\.gridItem\[data-rmg-grid-item-stage="1"\]\s*>\s*\.itemInner\s*\{[^}]*opacity:\s*0;[^}]*transition:/s,
    );
    expect(gridCss).toMatch(
      /\.gridItem\[data-rmg-grid-item-stage="1"\]\s*>\s*\.itemInner\s*\{[^}]*visibility:\s*hidden;/s,
    );
    expect(gridCss).toMatch(
      /\.gridItem\[data-rmg-grid-item-stage="1"\]\[data-rmg-grid-item-reveal="1"\]\s*>\s*\.itemInner\s*\{[^}]*opacity:\s*1;[^}]*visibility:\s*visible;/s,
    );
    expect(gridCss).toMatch(
      /\.gridItem\[data-rmg-grid-item-stage="1"\]\[data-rmg-grid-item-reveal="1"\]\s*>\s*\.itemInner\s*\{[^}]*transition-delay:\s*calc\([^}]*var\(--rmg-reveal-index,\s*0\)[^}]*var\(--rmg-reveal-stagger,\s*0ms\)/s,
    );
    expect(gridCss).toMatch(
      /\.gridItem\[data-rmg-grid-item-reveal="1"\]:not\(\[data-rmg-grid-item-compare="1"\]\)\s*>\s*\.itemSkeleton\s*\{[^}]*transition-delay:\s*calc\([^}]*var\(--rmg-reveal-index,\s*0\)[^}]*var\(--rmg-reveal-stagger,\s*0ms\)/s,
    );
    expect(masonryCss).toMatch(
      /\.masonryItem\[data-rmg-masonry-item-stage="1"\]\s*>\s*:not\(\[data-rmg-masonry-item-skeleton\]\)\s*\{[^}]*opacity:\s*0;[^}]*transition:/s,
    );
    expect(sliderCss).toMatch(/\.fade_container\s*\{[^}]*transition:/s);

    expect(gridCss).not.toContain("data-rmg-skeleton-reveal-gate");
    expect(masonryCss).not.toContain("data-rmg-skeleton-reveal-gate");
    expect(sliderCss).not.toContain("data-rmg-skeleton-reveal-gate");
  });

  test("lets per-item grid skeletons reserve intrinsic height and stretch", () => {
    const gridCss = readCss("../../grid/Grid.module.css");
    const masonryCss = readCss("../../masonry/Masonry.module.css");
    const skeletonCss = readCss("../../skeleton/GridSkeleton.module.css");

    expect(gridCss).toMatch(
      /\.gridItem\[data-rmg-grid-item-stage="1"\]\s*>\s*\.itemInner\s*\{[^}]*height:\s*100%;/s,
    );
    expect(gridCss).toMatch(
      /\.gridItem\[data-rmg-grid-item-layered="1"\]\s*>\s*\.itemInner\s*>\s*\*\s*\{[^}]*height:\s*100%;/s,
    );
    expect(gridCss).not.toMatch(
      /\.gridItem\[data-rmg-grid-item-stage="1"\]\s*>\s*\.itemInner\s*>\s*\*\s*\{[^}]*height:\s*100%;/s,
    );
    expect(gridCss).not.toContain("gridStructuredSkeletonPlane");
    expect(gridCss).not.toContain("gridPlaneStack");
    expect(gridCss).toMatch(
      /\.itemSkeleton\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*stretch;[^}]*min-height:\s*100%;/s,
    );
    expect(gridCss).toMatch(
      /\.itemSkeleton\s*>\s*\*\s*\{[^}]*flex:\s*1 1 auto;[^}]*width:\s*100%;[^}]*min-height:\s*100%;[^}]*height:\s*auto;/s,
    );
    expect(masonryCss).toMatch(
      /\.masonryItem\[data-rmg-masonry-item-compare="1"\]\s*>\s*\.itemSkeleton\s*\{[^}]*opacity:\s*var\(--rmg-masonry-item-skeleton-opacity,\s*1\);/s,
    );
    expect(masonryCss).not.toContain("rmgMasonryItemSkeletonEnter");
    expect(skeletonCss).toMatch(
      /\.gridSkeletonItem\s*\{[^}]*min-height:\s*100%;[^}]*height:\s*auto;[^}]*box-sizing:\s*border-box;/s,
    );
    expect(skeletonCss).toMatch(
      /\.gridSkeletonItemInner\s*\{[^}]*min-height:\s*100%;[^}]*height:\s*auto;[^}]*box-sizing:\s*border-box;/s,
    );
  });

  test("provides an internal reveal gate from skeleton content", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    try {
      await React.act(async () => {
        root.render(
          <SkeletonFrame
            skeletonNode={<div data-skeleton="true" />}
            ready={false}
            timing={{ minVisibleMs: 0, exitMs: 0 }}
          >
            <SkeletonRevealGateProbe />
          </SkeletonFrame>,
        );
      });

      expect(
        host.querySelector<HTMLElement>("[data-skeleton-reveal-gate]")?.dataset
          .skeletonRevealGate,
      ).toBe("locked");

      await React.act(async () => {
        root.render(
          <SkeletonFrame
            skeletonNode={<div data-skeleton="true" />}
            ready={true}
            force={{ enabled: true, showContent: true }}
            timing={{ minVisibleMs: 0, exitMs: 0 }}
          >
            <SkeletonRevealGateProbe />
          </SkeletonFrame>,
        );
      });

      expect(
        host.querySelector<HTMLElement>("[data-skeleton-reveal-gate]")?.dataset
          .skeletonRevealGate,
      ).toBe("unlocked");

      await React.act(async () => {
        root.render(<SkeletonRevealGateProbe />);
      });

      expect(
        host.querySelector<HTMLElement>("[data-skeleton-reveal-gate]")?.dataset
          .skeletonRevealGate,
      ).toBe("none");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });

  test("uses slider-style shimmer vars for built-in thumbnail placeholders", () => {
    const thumbnailCss = readCss("../../thumbnails/Thumbnails.module.css");

    expect(thumbnailCss).toContain(".thumbSkeleton::after");
    expect(thumbnailCss).toContain("var(--rmg-skel-bg, #e5e5e5)");
    expect(thumbnailCss).toContain("var(--rmg-skel-shimmer-enabled, 1)");
    expect(thumbnailCss).toContain("var(--rmg-skel-shimmer-duration, 1200ms)");
    expect(thumbnailCss).toContain("var(--rmg-skel-shimmer-timing, linear)");
    expect(thumbnailCss).toContain("transform: translateX(-100%) translateZ(0)");
    expect(thumbnailCss).toContain("transform: translateX(100%) translateZ(0)");
    expect(thumbnailCss).toContain("will-change: transform, opacity");
    expect(thumbnailCss).toContain("backface-visibility: hidden");
    expect(thumbnailCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.thumbSkeleton::after\s*\{[^}]*animation:\s*none;/s,
    );
    expect(thumbnailCss).not.toContain("--rmg-shimmer-");
  });

  test("keeps shared skeleton shimmer layers compositor-stable from first paint", () => {
    const sharedSkeletonCss = readCss("../skeleton/layout.module.css");
    const masonryLightCss = readCss("../../skeleton/MasonryLightSkeleton.module.css");
    const sliderCss = readCss("../../slider/Slider.module.css");

    for (const css of [sharedSkeletonCss, masonryLightCss, sliderCss]) {
      expect(css).toContain("transform: translateX(-100%) translateZ(0)");
      expect(css).toContain("transform: translateX(100%) translateZ(0)");
      expect(css).toContain("will-change: transform, opacity");
      expect(css).toContain("backface-visibility: hidden");
    }
  });

  test("keeps thumbnails rendering both content and loading wrappers during forced loading", () => {
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
        React.createElement(
          "button",
          { key: "thumb-1", type: "button" },
          "Thumb One",
        ),
        React.createElement(
          "button",
          { key: "thumb-2", type: "button" },
          "Thumb Two",
        ),
      ),
    );

    expect(thumbnailMarkup).toContain(ThumbnailStyles.thumbContentLayer);
    expect(thumbnailMarkup).toContain(ThumbnailStyles.thumbContentBlocked);
    expect(thumbnailMarkup).toContain(ThumbnailStyles.thumbLoadingLayer);
    expect(thumbnailMarkup).toContain('aria-hidden="true"');
    expect(thumbnailMarkup).toContain("--rmg-loading-fade-duration:880ms");
    expect(thumbnailMarkup).toContain("--rmg-loading-fade-enter-duration:880ms");
    expect(thumbnailMarkup).toContain("--rmg-loading-fade-exit-duration:880ms");
  });

  test("keeps mounted entries rendering both content and skeleton wrappers in compare mode", () => {
    const entriesCss = readCss("../../entries/Entries.module.css");

    expect(entriesCss).toMatch(/\.entrySkeletonWrap\s*\{[^}]*z-index:\s*0;/s);
    expect(entriesCss).toMatch(
      /\.entrySkeletonWrap\s*\{[^}]*--rmg-entry-skeleton-transition-duration:\s*var\(\s*--rmg-entry-skeleton-enter-duration,/s,
    );
    expect(entriesCss).toMatch(/\.entryInner\s*\{[^}]*z-index:\s*1;/s);
    expect(entriesCss).toMatch(
      /\.entryRow\[data-rmg-entry-ready="1"\]:not\(\[data-rmg-entry-compare="1"\]\)\s+\.entrySkeletonWrap\s*\{[^}]*--rmg-entry-skeleton-transition-duration:\s*var\(\s*--rmg-entry-skeleton-exit-duration,/s,
    );
    expect(entriesCss).toMatch(
      /\.entryRow\[data-rmg-entry-compare="1"\]\s+\.entrySkeletonWrap\s*\{[^}]*z-index:\s*2;/s,
    );
    expect(entriesCss).toMatch(
      /\.entrySkeletonWrap\[data-rmg-entry-shimmer="off"\]\s*\{[^}]*--rmg-skel-shimmer-enabled:\s*0;/s,
    );
    expect(entriesCss).toMatch(
      /\.entrySkeletonWrap\[data-rmg-entry-shimmer="off"\]\s+\.entrySkelRoot::after\s*\{[^}]*animation:\s*none;/s,
    );

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
            force: {
              showContent: true,
              skeletonOpacity: 0.4,
            },
          },
        },
        fsEnabled: false,
        openFullscreenAt: () => undefined,
        entryFlatIndex: [[0]],
        entryFlatIndexRef: React.createRef<number[][] | null>(),
        nodeFromMedia: (media) =>
          React.createElement("img", {
            src: (media as any).src,
            alt: (media as any).alt ?? "",
          }),
        renderMediaContainer: ({ mediaNodes }) =>
          React.createElement("div", null, mediaNodes),
        breakpoints: {},
      }),
    );

    expect(markup).toContain('data-rmg-entry-ready="1"');
    expect(markup).toContain('data-rmg-entry-compare="1"');
    expect(markup).toContain('data-rmg-entry-mounted="1"');
    expect(markup).toContain(EntryStyles.entrySkeletonWrap);
    expect(markup).toContain(EntryStyles.entrySkeletonBody);
    expect(markup).toContain(EntryStyles.entryInner);
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("--rmg-entry-skeleton-opacity:0.4");
    expect(markup).toContain("--rmg-entry-skeleton-enter-duration:220ms");
    expect(markup).toContain("--rmg-entry-skeleton-exit-duration:220ms");
    expect(markup).toContain('alt="Entry Alpha"');
  });

  test("does not offset entry shimmer phase during first paint", () => {
    const markup = renderToStaticMarkup(entryListElement());

    expect(markup).not.toContain("--rmg-entry-shimmer-delay");
  });

  test("uses a single root pseudo-element for entry shimmer", () => {
    const entriesCss = readCss("../../entries/Entries.module.css");
    const shimmerRule =
      entriesCss.match(/^\.entrySkelRoot::after\s*\{(?<body>[^}]*)\}/m)?.groups
        ?.body ?? "";

    expect(shimmerRule).toContain("transform: translateX(-100%) translateZ(0)");
    expect(shimmerRule).toContain("will-change: transform, opacity");
    expect(shimmerRule).toContain("backface-visibility: hidden");
    expect(entriesCss).not.toContain(".entrySkelTile::after");
    expect(entriesCss).toContain("transform: translateX(100%) translateZ(0);");
    expect(entriesCss).not.toContain("data-rmg-entry-shimmer-ready");
  });

  test("disables entry skeleton shimmer after the normal skeleton fade completes", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    try {
      await React.act(async () => {
        root.render(entryListElement());
      });

      const skeleton = host.querySelector("[data-rmg-entry-skeleton]");
      expect(skeleton?.getAttribute("data-rmg-entry-shimmer")).toBeNull();
      expect(
        host
          .querySelector("[data-rmg-entry-owner='0']")
          ?.getAttribute("data-rmg-entry-ready"),
      ).toBe("0");

      await flushEntryRevealFrames();

      expect(
        host
          .querySelector("[data-rmg-entry-owner='0']")
          ?.getAttribute("data-rmg-entry-ready"),
      ).toBe("1");

      await React.act(async () => {
        dispatchOpacityTransitionEnd(skeleton!);
      });

      expect(
        host
          .querySelector("[data-rmg-entry-skeleton]")
          ?.getAttribute("data-rmg-entry-shimmer"),
      ).toBe("off");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });

  test("stages entry readiness before starting nested media reveal", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const mediaRevealStates: Array<boolean | undefined> = [];

    try {
      await React.act(async () => {
        root.render(
          entryListElement(undefined, ({ entryInView, mediaNodes }) => {
            mediaRevealStates.push(entryInView);

            return React.createElement(
              "div",
              { "data-entry-media-in-view": entryInView ? "1" : "0" },
              mediaNodes,
            );
          }),
        );
      });

      expect(
        host
          .querySelector("[data-rmg-entry-owner='0']")
          ?.getAttribute("data-rmg-entry-ready"),
      ).toBe("0");
      expect(
        host
          .querySelector("[data-entry-media-in-view]")
          ?.getAttribute("data-entry-media-in-view"),
      ).toBe("0");

      await flushEntryRevealFrames();

      expect(
        host
          .querySelector("[data-rmg-entry-owner='0']")
          ?.getAttribute("data-rmg-entry-ready"),
      ).toBe("1");
      expect(
        host
          .querySelector("[data-entry-media-in-view]")
          ?.getAttribute("data-entry-media-in-view"),
      ).toBe("1");
      expect(mediaRevealStates).toContain(false);
      expect(mediaRevealStates[mediaRevealStates.length - 1]).toBe(true);
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });

  test("keeps newly mounted entry content hidden before the first dynamic reveal", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    try {
      await React.act(async () => {
        root.render(entryListElement());
      });

      const row = () => host.querySelector("[data-rmg-entry-owner='0']");

      expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");
      expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

      await flushEntryContentPaintFrames();

      expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");
      expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

      await flushAnimationFrames(4);

      expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });

  test("keeps entry skeleton shimmer active in compare mode", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    try {
      await React.act(async () => {
        root.render(
          entryListElement({
            showContent: true,
            skeletonOpacity: 0.4,
          }),
        );
      });

      const skeleton = host.querySelector("[data-rmg-entry-skeleton]");
      expect(skeleton?.getAttribute("data-rmg-entry-shimmer")).toBeNull();

      await React.act(async () => {
        dispatchOpacityTransitionEnd(skeleton!);
      });

      expect(
        host
          .querySelector("[data-rmg-entry-skeleton]")
          ?.getAttribute("data-rmg-entry-shimmer"),
      ).toBeNull();
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });
});
