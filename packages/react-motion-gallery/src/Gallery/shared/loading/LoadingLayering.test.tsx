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
import { useSkeletonIntroGate } from "./skeletonIntroGate";

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
    window.setTimeout(() => callback(performance.now()), 0)
  );
  vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
    window.clearTimeout(handle)
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
  }) => React.ReactNode = ({ mediaNodes }) => React.createElement("div", null, mediaNodes)
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

async function flushEntryRevealFrames() {
  await React.act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  });
}

function dispatchOpacityTransitionEnd(node: Element) {
  const event = new Event("transitionend", { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: "opacity" });
  node.dispatchEvent(event);
}

function SkeletonIntroGateProbe() {
  const gate = useSkeletonIntroGate();
  const label = gate == null ? "none" : gate ? "unlocked" : "locked";
  return <div data-skeleton-intro-gate={label} />;
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
      })
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
      })
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
      })
    ).toEqual({
      "--rmg-loading-fade-duration": "600ms",
    });

    expect(
      resolveCompareLoadingLayerStyle({
        exitMs: 600,
        compareMode: true,
        loadingLayerOpacity: 0.35,
        opacityVarName: "--example-loading-opacity",
      })
    ).toEqual({
      "--rmg-loading-fade-duration": "600ms",
      "--example-loading-opacity": 0.35,
    });

    expect(
      resolveCompareLoadingLayerStyle({
        exitMs: 600,
        compareMode: false,
        loadingLayerOpacity: 1,
        opacityVarName: "--example-loading-opacity",
        hidden: true,
      })
    ).toEqual({
      "--rmg-loading-fade-duration": "600ms",
      "--example-loading-opacity": 0,
    });
  });

  test("uses always-above z-index values across the shared loading shells", () => {
    const skeletonCss = readCss("../../skeleton/Skeleton.module.css");
    const thumbnailCss = readCss("../../thumbnails/Thumbnails.module.css");

    expect(skeletonCss).toMatch(/\.contentLayer\s*\{[^}]*z-index:\s*2;/s);
    expect(skeletonCss).toMatch(/\.loadingLayer\s*\{[^}]*z-index:\s*1;/s);
    expect(skeletonCss).toMatch(/\.loadingLayerOverlay\s*\{[^}]*overflow:\s*visible;/s);

    expect(thumbnailCss).toMatch(/\.thumbContentLayer\s*\{[^}]*z-index:\s*2;/s);
    expect(thumbnailCss).toMatch(/\.thumbLoadingLayer\s*\{[^}]*z-index:\s*1;/s);
    expect(skeletonCss).toMatch(/\.loadingLayerCompare\s*\{[^}]*z-index:\s*3;/s);
    expect(thumbnailCss).toMatch(/\.thumbLoadingLayerCompare\s*\{[^}]*z-index:\s*3;/s);
  });

  test("keeps intro opacity transitions on the pre-active state for Safari", () => {
    const gridCss = readCss("../../grid/Grid.module.css");
    const masonryCss = readCss("../../masonry/Masonry.module.css");
    const sliderCss = readCss("../../slider/Slider.module.css");

    expect(gridCss).toMatch(/\.introContainer\s*\{[^}]*opacity:\s*0;[^}]*transition:/s);
    expect(masonryCss).toMatch(/\.introContainer\s*\{[^}]*opacity:\s*0;[^}]*transition:/s);
    expect(sliderCss).toMatch(/\.fade_container\s*\{[^}]*transition:/s);

    expect(gridCss).not.toContain("data-rmg-skeleton-intro-gate");
    expect(masonryCss).not.toContain("data-rmg-skeleton-intro-gate");
    expect(sliderCss).not.toContain("data-rmg-skeleton-intro-gate");
  });

  test("provides an internal intro gate from skeleton content", async () => {
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
            <SkeletonIntroGateProbe />
          </SkeletonFrame>
        );
      });

      expect(
        host.querySelector<HTMLElement>("[data-skeleton-intro-gate]")?.dataset
          .skeletonIntroGate
      ).toBe("locked");

      await React.act(async () => {
        root.render(
          <SkeletonFrame
            skeletonNode={<div data-skeleton="true" />}
            ready={true}
            force={{ enabled: true, showContent: true }}
            timing={{ minVisibleMs: 0, exitMs: 0 }}
          >
            <SkeletonIntroGateProbe />
          </SkeletonFrame>
        );
      });

      expect(
        host.querySelector<HTMLElement>("[data-skeleton-intro-gate]")?.dataset
          .skeletonIntroGate
      ).toBe("unlocked");

      await React.act(async () => {
        root.render(<SkeletonIntroGateProbe />);
      });

      expect(
        host.querySelector<HTMLElement>("[data-skeleton-intro-gate]")?.dataset
          .skeletonIntroGate
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
    expect(thumbnailCss).toContain("transform: translateX(-100%)");
    expect(thumbnailCss).toContain("transform: translateX(100%)");
    expect(thumbnailCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.thumbSkeleton::after\s*\{[^}]*animation:\s*none;/s
    );
    expect(thumbnailCss).not.toContain("--rmg-shimmer-");
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

  test("keeps mounted entries rendering both content and skeleton wrappers in compare mode", () => {
    const entriesCss = readCss("../../entries/Entries.module.css");

    expect(entriesCss).toMatch(/\.entrySkeletonWrap\s*\{[^}]*z-index:\s*0;/s);
    expect(entriesCss).toMatch(/\.entryInner\s*\{[^}]*z-index:\s*1;/s);
    expect(entriesCss).toMatch(
      /\.entryRow\[data-rmg-entry-compare="1"\]\s+\.entrySkeletonWrap\s*\{[^}]*z-index:\s*2;/s
    );
    expect(entriesCss).toMatch(
      /\.entrySkeletonWrap\[data-rmg-entry-shimmer="off"\]\s*\{[^}]*--rmg-skel-shimmer-enabled:\s*0;/s
    );
    expect(entriesCss).toMatch(
      /\.entrySkeletonWrap\[data-rmg-entry-shimmer="off"\]\s+\.entrySkelTile::after\s*\{[^}]*animation:\s*none;/s
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
        entryFlatIndexRef: React.createRef<number[][] | null>(),
        nodeFromMedia: (media) =>
          React.createElement("img", {
            src: (media as any).src,
            alt: (media as any).alt ?? "",
          }),
        renderMediaContainer: ({ mediaNodes }) =>
          React.createElement("div", null, mediaNodes),
        breakpoints: {},
      })
    );

    expect(markup).toContain('data-rmg-entry-ready="1"');
    expect(markup).toContain('data-rmg-entry-compare="1"');
    expect(markup).toContain('data-rmg-entry-mounted="1"');
    expect(markup).toContain(EntryStyles.entrySkeletonWrap);
    expect(markup).toContain(EntryStyles.entrySkeletonBody);
    expect(markup).toContain(EntryStyles.entryInner);
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("--rmg-entry-skeleton-opacity:0.4");
    expect(markup).toContain('alt="Entry Alpha"');
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
          ?.getAttribute("data-rmg-entry-ready")
      ).toBe("0");

      await flushEntryRevealFrames();

      expect(
        host
          .querySelector("[data-rmg-entry-owner='0']")
          ?.getAttribute("data-rmg-entry-ready")
      ).toBe("1");

      await React.act(async () => {
        dispatchOpacityTransitionEnd(skeleton!);
      });

      expect(
        host
          .querySelector("[data-rmg-entry-skeleton]")
          ?.getAttribute("data-rmg-entry-shimmer")
      ).toBe("off");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });

  test("stages entry readiness before starting nested media intro", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const mediaIntroStates: Array<boolean | undefined> = [];

    try {
      await React.act(async () => {
        root.render(
          entryListElement(undefined, ({ entryInView, mediaNodes }) => {
            mediaIntroStates.push(entryInView);

            return React.createElement(
              "div",
              { "data-entry-media-in-view": entryInView ? "1" : "0" },
              mediaNodes
            );
          })
        );
      });

      expect(
        host
          .querySelector("[data-rmg-entry-owner='0']")
          ?.getAttribute("data-rmg-entry-ready")
      ).toBe("0");
      expect(
        host
          .querySelector("[data-entry-media-in-view]")
          ?.getAttribute("data-entry-media-in-view")
      ).toBe("0");

      await flushEntryRevealFrames();

      expect(
        host
          .querySelector("[data-rmg-entry-owner='0']")
          ?.getAttribute("data-rmg-entry-ready")
      ).toBe("1");
      expect(
        host
          .querySelector("[data-entry-media-in-view]")
          ?.getAttribute("data-entry-media-in-view")
      ).toBe("1");
      expect(mediaIntroStates).toContain(false);
      expect(mediaIntroStates[mediaIntroStates.length - 1]).toBe(true);
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
          })
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
          ?.getAttribute("data-rmg-entry-shimmer")
      ).toBeNull();
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });
});
