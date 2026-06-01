// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import { buildStableScopeId } from "../shared/stableScope";
import skeletonFrameStyles from "../skeleton/Skeleton.module.css";
import { CachedMasonrySkeleton } from "../skeleton/cache-masonry-structured";
import {
  MasonrySkeleton,
  MasonrySkeletonCore,
} from "../skeleton/masonry-structured";
import {
  MasonrySkeletonCard,
  resolveActiveFlexStateKey,
} from "../skeleton/MasonrySkeleton";

function makeDomRect(width: number, height = 0): DOMRect {
  return {
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    right: width,
    bottom: height,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

class MockResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: makeDomRect(962),
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }

  unobserve() {}

  disconnect() {}
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("MasonrySkeleton layout and text nodes", () => {
  test("resolves the active responsive masonry variant from viewport width", () => {
    expect(
      resolveActiveFlexStateKey(
        [
          { minWidth: 0, columns: 1, gapPx: 12, key: "c1_g12" },
          { minWidth: 720, columns: 2, gapPx: 12, key: "c2_g12" },
          { minWidth: 1140, columns: 3, gapPx: 18, key: "c3_g18" },
        ],
        1280,
      ),
    ).toBe("c3_g18");

    expect(
      resolveActiveFlexStateKey(
        [
          { minWidth: 0, columns: 1, gapPx: 12, key: "c1_g12" },
          { minWidth: 720, columns: 2, gapPx: 12, key: "c2_g12" },
          { minWidth: 1140, columns: 3, gapPx: 18, key: "c3_g18" },
        ],
        900,
      ),
    ).toBe("c2_g12");
  });

  test("preserves the legacy masonry block skeleton when layout is omitted", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        ratios: [80],
        classNames: {
          item: "legacy-skeleton",
        },
      }),
    );

    expect(markup).toContain("legacy-skeleton");
    expect(markup).toContain("container-type:inline-size");
    expect(markup).toContain("height:43px");
    expect(markup).not.toContain('data-rmg-skel-text="true"');
  });

  test("applies responsive masonry spans to the positioned skeleton items", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 2,
        columns: { 0: 1, 900: 4 },
        gap: 16,
        heightsPx: [240, 180],
        spans: [{ 0: "full", 900: 2 }, 1],
        placement: "horizontalOrder",
        viewportWidth: 1000,
      }),
    );

    expect(markup).toContain('data-rmg-mskel-variant="c4_g16"');
    expect(markup).toContain("--rmg-cols:4");
    expect(markup).toContain("--rmg-mskel-width-0:calc(");
    expect(markup).toContain("var(--rmg-gap)");
    expect(markup).toContain("left:calc(");
  });

  test("renders masonry layout text nodes with wrapper styling", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        spec: {
          ratios: [100],
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: 12,
              borderRadius: 18,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            },
            item: {
              kind: "text",
              barHeight: 16,
              lineHeight: 1.5,
              lines: 2,
              style: {
                width: "88%",
              },
            },
          },
        },
      }),
    );

    expect(markup).toContain('data-rmg-skel-text="true"');
    expect(markup.match(/data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(
      2,
    );
    expect(markup).toContain("padding:12px");
    expect(markup).toContain("border-radius:18px");
    expect(markup).toContain("--rmg-masonry-skel-wrap-shadow:0 8px 24px");
    expect(markup).toContain("box-shadow:0 8px 24px");
    expect(markup).toContain(sharedSkeletonStyles.skelCardShimmer);
  });

  test("auto-measures layout width for container-keyed masonry text prediction", async () => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBoundingClientRectMock() {
        return this.hasAttribute("data-rmg-skeleton-scope")
          ? makeDomRect(962)
          : makeDomRect(0);
      },
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = createRoot(container);

    try {
      await React.act(async () => {
        root?.render(
          <MasonrySkeleton
            layout={{
              layout: {
                kind: "masonry",
                itemWrapStyle: { padding: 10 },
                slots: [
                  {},
                  {
                    span: { 0: 1, 1140: 2 },
                    item: {
                      kind: "rect",
                      style: { width: "100%", aspectRatio: "4 / 5" },
                    },
                  },
                ],
                item: {
                  kind: "col",
                  style: { gap: 12 },
                  children: [
                    {
                      kind: "rect",
                      style: { width: "100%", aspectRatio: "5 / 4" },
                    },
                    {
                      kind: "text",
                      barHeight: 14.72,
                      lineHeight: 1.55,
                      lines: { 0: 4, 240: 1 },
                      responsiveBy: "container",
                    },
                  ],
                },
              },
            }}
            masonry={{
              count: 2,
              columns: { 0: 1, 1140: 4 },
              gap: { 0: 12, 1140: 18 },
              placement: "horizontalOrder",
              viewportWidth: 1600,
            }}
          />,
        );
      });

      const variant = container.querySelector(
        '[data-rmg-mskel-variant="c4_g18"]',
      );
      const variantStyle = variant?.getAttribute("style") ?? "";

      expect(variantStyle).toContain("103.25");
      expect(variantStyle).not.toContain("34.816");
    } finally {
      await React.act(async () => {
        root?.unmount();
      });
      root = null;
      container.remove();
    }
  });

  test("renders wrapped masonry skeleton as the layout owner before content", () => {
    const markup = renderToStaticMarkup(
      <MasonrySkeleton
        layout={{
          layout: {
            kind: "masonry",
            itemWrapStyle: { padding: 10 },
            item: {
              kind: "rect",
              style: { width: "100%", aspectRatio: "4 / 5" },
            },
            slots: [{ span: { 0: 1, 1140: 2 } }, {}],
          },
        }}
        ready={false}
        masonry={{
          count: 2,
          columns: { 0: 1, 1140: 4 },
          gap: { 0: 12, 1140: 18 },
          placement: "horizontalOrder",
        }}
      >
        <div data-live-masonry-placeholder="true" style={{ height: 0 }} />
      </MasonrySkeleton>,
    );

    const wrapperIndex = markup.indexOf("data-rmg-skeleton-wrapper");
    const loadingIndex = markup.indexOf("data-rmg-skeleton-loading-layer");
    const contentIndex = markup.indexOf("data-rmg-skeleton-content-layer");

    expect(wrapperIndex).toBeGreaterThanOrEqual(0);
    expect(loadingIndex).toBeGreaterThanOrEqual(0);
    expect(contentIndex).toBeGreaterThanOrEqual(0);
    expect(loadingIndex).toBeLessThan(contentIndex);
    expect(markup).toContain("[data-rmg-masonry-skeleton-shell");
    expect(markup).toContain("data-rmg-masonry-skeleton-shell=");
    expect(markup).toContain('data-rmg-skeleton-layout-owner="skeleton"');
    expect(markup).toContain(skeletonFrameStyles.contentLayerLayoutLocked);
    expect(markup).toContain(skeletonFrameStyles.loadingLayerLayoutOwner);
    expect(markup).not.toContain(skeletonFrameStyles.loadingLayerOverlay);
  });

  test("keeps the wrapped masonry skeleton in flow while it exits", async () => {
    vi.useFakeTimers();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const renderSkeleton = (ready: boolean) => (
      <MasonrySkeleton
        layout={{
          layout: {
            kind: "masonry",
            item: {
              kind: "rect",
              style: { width: "100%", aspectRatio: "4 / 5" },
            },
          },
        }}
        ready={ready}
        timing={{ minVisibleMs: 0, exitMs: 600 }}
        masonry={{
          count: 2,
          columns: { 0: 1, 1140: 3 },
          gap: { 0: 12, 1140: 18 },
        }}
      >
        <div data-live-masonry-placeholder="true" style={{ height: 0 }} />
      </MasonrySkeleton>
    );

    try {
      await React.act(async () => {
        root.render(renderSkeleton(false));
      });

      const wrapper = () =>
        container.querySelector("[data-rmg-skeleton-wrapper]");
      const loadingLayer = () =>
        container.querySelector("[data-rmg-skeleton-loading-layer]");

      expect(wrapper()?.getAttribute("data-rmg-skeleton-layout-owner")).toBe(
        "skeleton",
      );
      expect(loadingLayer()).not.toBeNull();

      await React.act(async () => {
        root.render(renderSkeleton(true));
        await Promise.resolve();
      });

      expect(wrapper()?.getAttribute("data-rmg-skeleton-layout-owner")).toBe(
        "skeleton",
      );
      expect(loadingLayer()).not.toBeNull();

      await React.act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(wrapper()?.getAttribute("data-rmg-skeleton-layout-owner")).toBe(
        "content",
      );
      expect(loadingLayer()).toBeNull();
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
      vi.useRealTimers();
    }
  });

  test("keeps wrapped masonry skeleton text stable when cache arrives while loading", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const layout = {
      layout: {
        kind: "masonry" as const,
        item: {
          kind: "text" as const,
          textId: "title",
          barHeight: 10,
          lineHeight: 1,
          lines: 1,
        },
      },
    };
    const cacheSnapshot = {
      version: 1 as const,
      key: "demo",
      scopeId: "stable-scope",
      kind: "masonry" as const,
      routeKey: "/demo",
      createdAt: Date.now(),
      widthBucketMin: 0,
      viewportWidth: 1200,
      masonry: {
        variantKey: "c1_g0",
      },
      text: {
        title: {
          lines: 4,
          barHeight: 10,
          lineHeight: 1,
          barWidths: ["100%", "100%", "100%", "64%"],
        },
      },
    };
    const renderSkeleton = (
      snapshot: typeof cacheSnapshot | null | undefined,
    ) => (
      <MasonrySkeletonCore
        layout={layout}
        scopeId="stable-scope"
        cacheSnapshot={snapshot}
        masonry={{ count: 1, columns: 1, gap: 0 }}
        ready={false}
      >
        <div data-live-masonry-placeholder="true" />
      </MasonrySkeletonCore>
    );

    try {
      await React.act(async () => {
        root.render(renderSkeleton(null));
      });

      expect(
        container.querySelectorAll('[data-rmg-skel-text-line="true"]'),
      ).toHaveLength(1);

      await React.act(async () => {
        root.render(renderSkeleton(cacheSnapshot));
      });

      expect(
        container.querySelectorAll('[data-rmg-skel-text-line="true"]'),
      ).toHaveLength(1);
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("streams wrapped masonry skeleton DOM before the reserve shell rule", () => {
    const markup = renderToStaticMarkup(
      <MasonrySkeleton
        layout={{
          layout: {
            kind: "masonry",
            itemWrapStyle: { padding: 10 },
            item: {
              kind: "col",
              style: { gap: 12 },
              children: [
                {
                  kind: "rect",
                  style: { width: "100%", aspectRatio: "5 / 4" },
                },
                {
                  kind: "text",
                  barHeight: 14.72,
                  lineHeight: 1.55,
                  lines: { 0: 5, 172.5: 4, 200.453: 3, 288: 2 },
                  responsiveBy: "container",
                },
              ],
            },
            slots: [
              { span: { 0: 1, 1140: 2 } },
              {},
              {},
              { span: { 0: 1, 1140: 2 } },
              {},
              {},
            ],
          },
        }}
        ready={false}
        masonry={{
          count: 6,
          columns: { 0: 1, 720: 2, 1140: 4 },
          gap: { 0: 12, 1140: 18 },
          placement: "horizontalOrder",
        }}
      >
        <div data-live-masonry-placeholder="true" style={{ height: 0 }} />
      </MasonrySkeleton>,
    );

    const wrapperIndex = markup.indexOf("data-rmg-skeleton-wrapper");
    const firstVariantIndex = markup.indexOf(
      "<div data-rmg-mskel-variant",
      wrapperIndex,
    );
    const firstSkeletonItemIndex = markup.indexOf(
      "<div data-rmg-mskel-index",
      firstVariantIndex,
    );
    const firstTextCssIndex = markup.indexOf(
      '[data-rmg-skel-text-line="true"]',
      wrapperIndex,
    );
    const scaffoldCssIndex = markup.indexOf("@container", wrapperIndex);
    const reserveStyleIndex = markup.indexOf(
      "[data-rmg-masonry-skeleton-shell",
      firstSkeletonItemIndex,
    );

    expect(wrapperIndex).toBeGreaterThanOrEqual(0);
    expect(firstVariantIndex).toBeGreaterThan(wrapperIndex);
    expect(firstSkeletonItemIndex).toBeGreaterThan(firstVariantIndex);
    expect(firstTextCssIndex).toBeGreaterThan(wrapperIndex);
    expect(firstTextCssIndex).toBeLessThan(firstVariantIndex);
    expect(scaffoldCssIndex).toBeGreaterThan(wrapperIndex);
    expect(scaffoldCssIndex).toBeLessThan(firstVariantIndex);
    expect(reserveStyleIndex).toBeGreaterThan(firstSkeletonItemIndex);
    expect(markup).toContain("data-rmg-masonry-skeleton-shell=");
    expect(markup).not.toContain("rmg-mskel-safari");
    expect(firstSkeletonItemIndex - wrapperIndex).toBeLessThan(300_000);
  });

  test("keeps single-span structured masonry skeletons in flow layout", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 4,
        columns: { 0: 1, 720: 2, 1140: 3 },
        gap: { 0: 12, 1140: 18 },
        spec: {
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: 12,
            },
            item: {
              kind: "col",
              style: {
                gap: 12,
              },
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "4 / 5",
                  },
                },
                {
                  kind: "text",
                  barHeight: 14,
                  lineHeight: 1.5,
                  lines: 2,
                  style: {
                    width: "88%",
                  },
                },
              ],
            },
            slots: [
              {},
              {
                item: {
                  kind: "col",
                  style: {
                    gap: 12,
                  },
                  children: [
                    {
                      kind: "rect",
                      style: {
                        width: "100%",
                        aspectRatio: "3 / 5",
                      },
                    },
                    {
                      kind: "text",
                      barHeight: 14,
                      lineHeight: 1.5,
                      lines: 3,
                      style: {
                        width: "88%",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      }),
    );

    expect(markup).toContain("display:flex");
    expect(markup).toContain("--rmg-mskel-colw");
    expect(markup).toContain("--rmg-mskel-height-0");
    expect(markup).not.toContain("height:max(");
    expect(markup).not.toContain("position:absolute;top:calc(");

    expect(markup).not.toContain("rmg-mskel-safari");
  });

  test("streams the widest first-paint masonry variant before lower breakpoints", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 2,
        columns: { 0: 1, 720: 2, 1140: 3 },
        gap: { 0: 12, 1140: 18 },
        spec: {
          layout: {
            kind: "masonry",
            item: {
              kind: "rect",
              style: { width: "100%", height: 120 },
            },
          },
        },
      }),
    );

    const firstVariant = markup.match(
      /<div data-rmg-mskel-variant="([^"]+)"/,
    )?.[1];

    expect(firstVariant).toBe("c3_g18");
  });

  test("inlines container-keyed masonry text state for first paint", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        columns: { 0: 1, 1140: 3 },
        gap: { 0: 12, 1140: 18 },
        viewportWidth: 1280,
        layoutWidthPx: 960,
        spec: {
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: "10px 10px 14px",
            },
            item: {
              kind: "text",
              responsiveBy: "container",
              barHeight: 14,
              lineHeight: 1.5,
              lines: { 0: 5, 240: 2 },
              style: { width: "100%" },
            },
          },
        },
      }),
    );

    const firstVariantIndex = markup.indexOf("<div data-rmg-mskel-variant");
    const scaffoldStyleIndex = markup.indexOf("<style", firstVariantIndex);
    const variantMarkup = markup.slice(firstVariantIndex, scaffoldStyleIndex);
    const hiddenLines =
      variantMarkup.match(
        /data-rmg-skel-text-line="true"[^>]*display:none/g,
      ) ?? [];

    expect(hiddenLines).toHaveLength(3);
  });

  test("does not add a trailing bottom gap to flow-layout masonry columns", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 4,
        columns: 2,
        gap: 12,
        viewportWidth: 900,
        spec: {
          layout: {
            kind: "masonry",
            item: {
              kind: "rect",
              style: {
                width: "100%",
                height: 120,
              },
            },
          },
        },
      }),
    );

    expect(markup).toContain("margin-bottom:12px");
    expect(markup).toContain("margin-bottom:0px");
  });

  test("uses positioned layout for structured masonry skeletons when spans are present", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 3,
        columns: { 0: 1, 900: 3 },
        gap: 16,
        viewportWidth: 1200,
        spec: {
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: 12,
            },
            item: {
              kind: "rect",
              style: {
                width: "100%",
                aspectRatio: "4 / 5",
              },
            },
            slots: [
              {
                span: 2,
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "16 / 9",
                  },
                },
              },
              {},
              {},
            ],
          },
        },
      }),
    );

    expect(markup).toContain("height:calc(");
    expect(markup).toMatch(/position:absolute;[^"]*top:/);
    expect(markup).toContain("height:calc(");
    expect(markup).not.toContain("min-height:calc(");
  });

  test("emits container-query scaffold overrides for SSR positioned masonry skeletons", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 6,
        columns: { 0: 1, 1140: 4 },
        gap: { 0: 12, 1140: 18 },
        placement: "horizontalOrder",
        spec: {
          layout: {
            kind: "masonry",
            itemWrapStyle: { padding: 10 },
            item: {
              kind: "col",
              style: { gap: 12 },
              children: [
                {
                  kind: "rect",
                  style: { width: "100%", aspectRatio: "5 / 4" },
                },
                {
                  kind: "col",
                  style: { gap: 5, padding: "0 4px" },
                  children: [
                    {
                      kind: "text",
                      barHeight: 16.32,
                      lineHeight: 1.2,
                      lines: { 0: 2, 199.484: 1 },
                      responsiveBy: "container",
                    },
                    {
                      kind: "text",
                      barHeight: 14.72,
                      lineHeight: 1.55,
                      lines: { 0: 5, 172.5: 4, 200.453: 3, 288: 2 },
                      responsiveBy: "container",
                    },
                  ],
                },
              ],
            },
            slots: [
              {
                span: { 0: 1, 1140: 2 },
                item: {
                  kind: "rect",
                  style: { width: "100%", aspectRatio: "4 / 5" },
                },
              },
              {},
              {},
              {
                span: { 0: 1, 1140: 2 },
                item: {
                  kind: "rect",
                  style: { width: "100%", aspectRatio: "16 / 10" },
                },
              },
              {},
              {},
            ],
          },
        },
      }),
    );

    expect(markup).toContain('data-rmg-mskel-index="1"');
    expect(markup).toContain("@container (min-width:856px)");
    expect(markup).toContain(
      "--rmg-mskel-height-1:calc(((((var(--rmg-mskel-width-1)) - (20)) / 1.25) + (147.40625px)) + (20)) !important;",
    );
    expect(markup).toContain(
      '> [data-rmg-mskel-index="4"]{top:calc((var(--rmg-mskel-height-1)) + (18px)) !important;',
    );
  });

  test("keeps SSR span scaffold top and shell-height formulas compact", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 8,
        columns: { 0: 1, 760: 2, 1160: 4 },
        gap: { 0: 12, 1160: 18 },
        spec: {
          radius: 20,
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: "12px 12px 16px",
              borderRadius: 28,
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 24px 54px rgba(15, 23, 42, 0.1)",
            },
            item: {
              kind: "col",
              style: {
                gap: 14,
              },
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "16 / 11",
                    borderRadius: 20,
                  },
                },
                {
                  kind: "col",
                  style: {
                    gap: 6,
                    padding: "0 4px",
                  },
                  children: [
                    {
                      kind: "rect",
                      style: {
                        width: 56,
                        height: 2,
                        marginBottom: 1,
                        borderRadius: 999,
                      },
                    },
                    {
                      kind: "text",
                      barHeight: 11.84,
                      lineHeight: 1.35,
                      lines: 1,
                      lastBarWidth: "100%",
                      style: {
                        width: "24%",
                        borderRadius: 999,
                      },
                    },
                    {
                      kind: "text",
                      barHeight: 16.32,
                      lineHeight: 1.2,
                      lines: 1,
                      lastBarWidth: "100%",
                      style: {
                        width: "42%",
                      },
                    },
                    {
                      kind: "text",
                      barHeight: 14.72,
                      lineHeight: 1.55,
                      lines: 1,
                      lastBarWidth: "100%",
                      style: {
                        width: "74%",
                      },
                    },
                  ],
                },
              ],
            },
            slots: [
              { span: { 0: 1, 760: 2, 1160: 2 } },
              {},
              {},
              { span: { 0: 1, 1160: 2 } },
              { span: { 0: 1, 760: 2, 1160: 2 } },
              {},
              {},
              { span: { 0: 1, 1160: 2 } },
            ],
          },
        },
      }),
    );

    const variantMatch = markup.match(
      /<div data-rmg-mskel-variant="c4_g18" style="([^"]+)"/,
    );

    expect(variantMatch?.[1]).toBeTruthy();

    const variantStyle = variantMatch![1];

    expect(variantStyle.length).toBeLessThan(6000);
    expect(variantStyle).toContain("--rmg-mskel-colw:calc(");
    expect(variantStyle).toContain("--rmg-mskel-width-3:calc(");
    expect(variantStyle).toContain("--rmg-mskel-height-3:calc(");
    expect(variantStyle).toContain("height:calc(");
    expect(variantStyle).not.toContain("max(");
    expect(variantStyle).not.toContain("--rmg-mskel-top-");
    expect(variantStyle).not.toContain("--rmg-mskel-bottom-");
    expect(variantStyle).not.toContain("--rmg-mskel-shell-height");
  });

  test("supports per-slot masonry skeleton overrides for layout and height ratios", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 2,
        spec: {
          ratios: [90, 90],
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: 10,
            },
            item: {
              kind: "text",
              barHeight: 12,
              lineHeight: 1.5,
              style: {
                width: "60%",
              },
            },
            slots: [
              {
                ratio: 150,
                item: {
                  kind: "col",
                  style: {
                    gap: 12,
                  },
                  children: [
                    {
                      kind: "rect",
                      style: {
                        width: "100%",
                        height: 220,
                      },
                    },
                    {
                      kind: "text",
                      barHeight: 14,
                      lineHeight: 1.5,
                      lines: 2,
                      style: {
                        width: "80%",
                      },
                    },
                  ],
                },
              },
              {
                ratio: 88,
                itemWrapStyle: {
                  borderRadius: 20,
                },
              },
            ],
          },
        },
      }),
    );

    expect(markup).toContain("height:220px");
    expect(markup).toContain("height:var(--rmg-mskel-height-0)");
    expect(markup).toContain("border-radius:20px");
    expect(markup.match(/data-rmg-skel-text="true"/g) ?? []).toHaveLength(2);
  });

  test("targets card-level shimmer controls for structured masonry items", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        spec: {
          shimmer: {
            enabled: false,
          },
          layout: {
            kind: "masonry",
            item: {
              kind: "col",
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: 180,
                  },
                  shimmer: {
                    durationMs: 933,
                  },
                },
                {
                  kind: "text",
                  barHeight: 16,
                  lineHeight: 1.5,
                  lines: 2,
                  shimmer: {
                    opacity: 0.41,
                  },
                  style: {
                    width: "88%",
                  },
                },
              ],
            },
          },
        },
      }),
    );

    expect(markup).toContain(sharedSkeletonStyles.skelCardShimmer);
    expect(markup).not.toContain(sharedSkeletonStyles.skelShimmer);
    expect(markup).toContain("--rmg-skel-card-shimmer-enabled:0");
    expect(markup).not.toContain("--rmg-skel-shimmer-duration:933ms");
    expect(markup).not.toContain("--rmg-skel-shimmer-opacity:0.41");
  });

  test("omits masonry card shimmer once the loading fade has completed", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        ratios: [80],
        disableShimmer: true,
        spec: {
          highlightColor: "#ffffff",
          shimmer: {
            durationMs: 933,
          },
        },
        classNames: {
          item: "legacy-skeleton",
        },
      }),
    );

    expect(markup).toContain("legacy-skeleton");
    expect(markup).not.toContain(sharedSkeletonStyles.skelCardShimmer);
    expect(markup).not.toContain("--rmg-skel-shimmer-duration:933ms");
    expect(markup).not.toContain("--rmg-skel-shimmer-c2:#ffffff");
  });

  test("renders responsive text CSS from the structured layout path", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        heightsPx: [300],
        spec: {
          layout: {
            kind: "masonry",
            item: {
              kind: "text",
              barHeight: 16,
              lineHeight: 1.5,
              lines: {
                0: 3,
                767: 2,
                1200: 1,
              },
              lastBarWidth: "56%",
              style: {
                width: "88%",
              },
            },
          },
        },
      }),
    );

    expect(
      (markup.match(/<div data-rmg-skel-text-line="true"/g) ?? []).length,
    ).toBeGreaterThanOrEqual(3);
    expect(markup).toContain("@media (min-width:767px)");
    expect(markup).toContain(
      '[data-rmg-skel-text-line="true"]{display:none !important;height:16px !important;}',
    );
    expect(markup).toContain(
      "nth-child(-n+2){display:block !important;width:100% !important;max-width:100% !important;}",
    );
    expect(markup).toContain("@media (min-width:1200px)");
    expect(markup).toContain("nth-child(1){max-width:56% !important;}");
    expect(markup).toContain("height:72px");
  });

  test("renders Safari geometry overrides for structured masonry text", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        columns: 2,
        spans: [2],
        spec: {
          layout: {
            kind: "masonry",
            item: {
              kind: "text",
              barHeight: 13,
              lineHeight: 1.62,
              lines: 3,
            },
          },
        },
      }),
    );

    expect(markup).toContain(
      "@supports (font: -apple-system-body) and (-webkit-hyphens: none)",
    );
    expect(markup).toContain("--rmg-mskel-height-0:63px");
    expect(markup).toContain("height:var(--rmg-mskel-height-0)");
    expect(markup).toContain("height:var(--rmg-mskel-height-0) !important");
  });

  test("renders compact active masonry snapshot markup when cache is valid", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        columns: { 0: 1, 900: 2 },
        gap: 8,
        viewportWidth: 920,
        layoutWidthPx: 600,
        cacheSnapshot: {
          version: 1,
          key: "demo",
          scopeId: "scope",
          kind: "masonry",
          createdAt: Date.now(),
          widthBucketMin: 900,
          viewportWidth: 920,
          layoutWidthPx: 600,
          masonry: {
            variantKey: "c2_g8",
            shellHeightPx: 123,
            itemHeightsPx: [123],
          },
          text: {
            body: {
              lines: 1,
              barWidths: ["240px"],
              barHeight: 14,
              lineHeight: 1.5,
            },
          },
        },
        spec: {
          layout: {
            kind: "masonry",
            item: {
              kind: "text",
              textId: "body",
              barHeight: 14,
              lineHeight: 1.5,
              lines: { 0: 4, 240: 1 },
              responsiveBy: "container",
            },
          },
        },
      }),
    );

    expect(
      markup.match(/<div[^>]*data-rmg-mskel-variant=/g) ?? [],
    ).toHaveLength(1);
    expect(markup).toContain('data-rmg-mskel-variant="c2_g8"');
    expect(markup).toContain("height:123px");
    expect(markup).toContain(
      "@supports (font: -apple-system-body) and (-webkit-hyphens: none)",
    );
    expect(markup).not.toContain("nth-child");
    expect(markup).not.toContain("@media (min-width:900px)");
    expect(markup).not.toContain("@container");
  });

  test("falls back to responsive output when a masonry snapshot scope mismatches", () => {
    const markup = renderToStaticMarkup(
      <CachedMasonrySkeleton
        layout={{
          layout: {
            kind: "masonry",
            item: {
              kind: "text",
              textId: "body",
              barHeight: 14,
              lineHeight: 1.5,
              lines: { 0: 4, 240: 1 },
              responsiveBy: "container",
            },
          },
        }}
        cache={{
          key: "demo",
          routeKey: "/demo",
          snapshot: {
            version: 1,
            key: "demo",
            scopeId: "wrong",
            kind: "masonry",
            routeKey: "/demo",
            createdAt: Date.now(),
            widthBucketMin: 0,
            viewportWidth: 920,
            masonry: {
              variantKey: "c1_g8",
              itemHeightsPx: [20],
            },
            text: {
              body: {
                lines: 1,
                barWidths: ["240px"],
              },
            },
          },
        }}
        masonry={{
          count: 1,
          columns: { 0: 1, 900: 2 },
          gap: 8,
        }}
      />,
    );

    expect(markup).toContain("nth-child");
    expect(markup).toContain("@container");
  });

  test("falls back to responsive output on the server when the viewport is unknown", () => {
    const layout = {
      layout: {
        kind: "masonry" as const,
        item: {
          kind: "rect" as const,
          style: {
            width: "100%",
            height: 120,
          },
        },
      },
    };
    const masonry = {
      count: 3,
      columns: { 0: 1, 720: 2, 1140: 3 },
      gap: { 0: 12, 1140: 18 },
      placement: "balanced" as const,
    };
    const scopeId = buildStableScopeId("skel_", {
      layout,
      breakpoints: BREAKPOINT_MAP,
      backgroundColor: undefined,
      radius: undefined,
      shimmer: undefined,
      disableShimmer: undefined,
      masonry,
    });

    const markup = renderToStaticMarkup(
      <CachedMasonrySkeleton
        layout={layout}
        cache={{
          key: "demo",
          routeKey: "/demo",
          snapshot: {
            version: 1,
            key: "demo",
            scopeId,
            kind: "masonry",
            routeKey: "/demo",
            createdAt: Date.now(),
            widthBucketMin: 720,
            viewportWidth: 1024,
            masonry: {
              variantKey: "c2_g12",
              itemHeightsPx: [120, 120, 120],
            },
            text: {},
          },
        }}
        masonry={masonry}
      />,
    );

    expect(
      markup.match(/<div[^>]*data-rmg-mskel-variant=/g) ?? [],
    ).toHaveLength(3);
    expect(markup).toContain('data-rmg-mskel-variant="c1_g12"');
    expect(markup).toContain('data-rmg-mskel-variant="c2_g12"');
    expect(markup).toContain('data-rmg-mskel-variant="c3_g18"');
    expect(markup).toContain("@media (min-width:1140px)");
  });

  test("keeps multi-line masonry text when only lastBarWidth is responsive", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        heightsPx: [300],
        spec: {
          layout: {
            kind: "masonry",
            item: {
              kind: "text",
              barHeight: 14.72,
              lineHeight: 1.55,
              lines: {
                0: 3,
                900: 3,
              },
              lastBarWidth: {
                0: "50%",
                900: "20%",
              },
              style: {
                width: "100%",
              },
            },
          },
        },
      }),
    );

    expect(
      (markup.match(/data-rmg-skel-text-line="true"/g) ?? []).length,
    ).toBeGreaterThanOrEqual(3);
    expect(markup).toMatch(/height:68\.4375/);
    expect(markup).toContain(
      "nth-child(-n+3){display:block !important;width:100% !important;max-width:100% !important;}",
    );
    expect(markup).toContain("@media (min-width:900px)");
    expect(markup).toContain("nth-child(3){max-width:20% !important;}");
    expect(markup).toContain("height:68.4375px");
  });

  test("grows the masonry shell when structured content is taller than the fallback ratio", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        spec: {
          ratios: [55],
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: 12,
            },
            item: {
              kind: "col",
              style: {
                gap: 12,
                padding: 14,
              },
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: 180,
                  },
                },
                {
                  kind: "text",
                  barHeight: 18,
                  lineHeight: 1.35,
                  lines: 2,
                  style: {
                    width: "88%",
                  },
                },
                {
                  kind: "text",
                  barHeight: 14,
                  lineHeight: 1.55,
                  lines: 3,
                  style: {
                    width: "100%",
                  },
                },
              ],
            },
          },
        },
      }),
    );

    expect(markup).toContain("height:var(--rmg-mskel-height-0)");
    expect(markup).not.toContain("height:132px");
  });

  test("uses percentage-width aspect ratio media and text blocks to infer shell height", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        spec: {
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: 12,
            },
            item: {
              kind: "col",
              style: {
                gap: 12,
                padding: 14,
              },
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "4 / 5",
                  },
                },
                {
                  kind: "text",
                  barHeight: 18,
                  lineHeight: 1.35,
                  lines: 2,
                  style: {
                    width: "88%",
                  },
                },
                {
                  kind: "text",
                  barHeight: 14,
                  lineHeight: 1.55,
                  lines: 3,
                  style: {
                    width: "100%",
                  },
                },
              ],
            },
          },
        },
      }),
    );

    expect(markup).toContain("height:var(--rmg-mskel-height-0)");
    expect(markup).not.toContain("height:132px");
  });

  test("renders structured masonry skeleton items in round-robin placement", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 2,
        placement: "roundRobin",
        spec: {
          layout: {
            kind: "masonry",
            item: {
              kind: "text",
              barHeight: 14,
              lineHeight: 1.5,
              style: {
                width: "72%",
              },
            },
          },
        },
      }),
    );

    expect(markup.match(/data-rmg-skel-text="true"/g) ?? []).toHaveLength(2);
    expect(markup).toContain('data-rmg-mskel-variant="c4_g8"');
  });

  test("emits container height corrections for non-spanning round-robin skeletons", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 3,
        columns: { 0: 1, 720: 2, 1140: 3 },
        gap: { 0: 12, 1140: 18 },
        placement: "roundRobin",
        spec: {
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: "10px 10px 14px",
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
            },
            item: {
              kind: "col",
              style: { gap: 12 },
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "4 / 5",
                    borderRadius: 16,
                  },
                },
                {
                  kind: "text",
                  responsiveBy: "container",
                  barHeight: 14,
                  lineHeight: 1.5,
                  lines: { 0: 5, 240: 2 },
                  style: { width: "100%" },
                },
              ],
            },
          },
        },
      }),
    );

    const firstVariantIndex = markup.indexOf("<div data-rmg-mskel-variant");
    const cssBeforeVariants = markup.slice(0, firstVariantIndex);

    expect(cssBeforeVariants).toContain("@container");
    expect(cssBeforeVariants).toContain("--rmg-mskel-height-0");
  });

  test("keeps span-positioned masonry scaffold CSS linear with custom properties", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 8,
        columns: { 0: 1, 760: 2, 1160: 4 },
        gap: { 0: 12, 1160: 18 },
        placement: "balanced",
        spec: {
          radius: 20,
          layout: {
            kind: "masonry",
            itemWrapStyle: {
              padding: "12px 12px 16px",
              borderRadius: 28,
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 24px 54px rgba(15, 23, 42, 0.1)",
            },
            item: {
              kind: "col",
              style: {
                gap: 14,
              },
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "16 / 11",
                    borderRadius: 20,
                  },
                },
                {
                  kind: "col",
                  style: {
                    gap: 6,
                    padding: "0 4px",
                  },
                  children: [
                    {
                      kind: "rect",
                      style: {
                        width: 56,
                        height: 2,
                        marginBottom: 1,
                        borderRadius: 999,
                      },
                    },
                    {
                      kind: "text",
                      barHeight: 11.84,
                      lineHeight: 1.35,
                      lines: 1,
                      lastBarWidth: "100%",
                      style: {
                        width: "24%",
                        borderRadius: 999,
                      },
                    },
                    {
                      kind: "text",
                      barHeight: 16.32,
                      lineHeight: 1.2,
                      lines: 1,
                      lastBarWidth: "100%",
                      style: {
                        width: "42%",
                      },
                    },
                    {
                      kind: "text",
                      barHeight: 14.72,
                      lineHeight: 1.55,
                      lines: 1,
                      lastBarWidth: "100%",
                      style: {
                        width: "74%",
                      },
                    },
                  ],
                },
              ],
            },
            slots: [
              { span: { 0: 1, 760: 2, 1160: 2 } },
              {},
              {},
              { span: { 0: 1, 1160: 2 } },
              { span: { 0: 1, 760: 2, 1160: 2 } },
              {},
              {},
              { span: { 0: 1, 1160: 2 } },
            ],
          },
        },
      }),
    );

    expect(markup).toContain("height:calc(");
    expect(markup).toContain("--rmg-mskel-colw:calc(");
    expect(markup).toContain("--rmg-mskel-width-0:");
    expect(markup).toContain("width:var(--rmg-mskel-width-0)");
    expect(markup).toContain("height:var(--rmg-mskel-height-0)");
    expect(markup).toContain("--rmg-mskel-height-0:");
    expect(markup).toContain("top:0px");
    expect(markup).not.toContain("position:absolute;top:max(calc(calc(");
    expect(markup).not.toContain("max(");
    expect(markup).not.toContain("--rmg-mskel-bottom-");
  });
});
