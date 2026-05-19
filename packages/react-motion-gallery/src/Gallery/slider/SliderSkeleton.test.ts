// @vitest-environment jsdom
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import { buildStableScopeId } from "../shared/stableScope";
import {
  getSkeletonCacheCookieName,
  parseSkeletonCacheCookie,
  serializeSkeletonCacheSnapshot,
} from "../skeleton/cache";
import type { SliderHandle } from "./types";
import {
  buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr,
  buildInitialHeightFromSkeletonSpecCssExpr,
  buildRowHeightFromSkeletonSpecCssExpr,
  collectResponsiveSliderCompensationBreakpoints,
  SliderSkeletonCard,
  type SliderSkeletonNode,
} from "./SliderSkeleton";
import { SliderSkeleton, buildScopedInitialHeightCss } from "../skeleton/slider";

const CUSTOM_BREAKPOINTS = {
  ...BREAKPOINT_MAP,
  tablet: 840,
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

describe("SliderSkeleton wrapper borders", () => {
  test("keeps explicit wrapper height as the outer border-box height", () => {
    const layout: SliderSkeletonNode = {
      kind: "slider",
      direction: "row",
      item: {
        kind: "rect",
        style: {
          width: "100%",
          height: "100%",
        },
      },
      itemWrapStyle: {
        width: 220,
        height: 140,
        border: "2px solid #cbd5e1",
      },
    };

    expect(buildRowHeightFromSkeletonSpecCssExpr(layout, 1, "peek")).toBe("140px");
    expect(buildInitialHeightFromSkeletonSpecCssExpr(layout, 1, "peek")).toBe("140px");
  });

  test("keeps wrapper aspect ratio math based on the outer width", () => {
    const layout: SliderSkeletonNode = {
      kind: "slider",
      direction: "row",
      item: {
        kind: "rect",
        style: {
          height: "100%",
        },
      },
      itemWrapStyle: {
        width: 300,
        aspectRatio: "3 / 2",
        border: "4px solid #0f172a",
      },
    };

    expect(buildRowHeightFromSkeletonSpecCssExpr(layout, 1, "peek")).toBe("calc(300px / 1.5)");
  });

  test("uses wrapper content width for child aspect-ratio math", () => {
    const layout: SliderSkeletonNode = {
      kind: "slider",
      direction: "row",
      item: {
        kind: "rect",
        style: {
          aspectRatio: 1,
        },
      },
      itemWrapStyle: {
        width: 200,
        border: "2px solid #0f172a",
      },
    };

    const rowHeight = buildRowHeightFromSkeletonSpecCssExpr(layout, 1, "peek");
    expect(rowHeight).toBe("max(4px, calc(calc(200px - 4px) + 4px))");
    expect(rowHeight).toContain("calc(200px - 4px)");
  });

  test("uses container padding shorthand in item height math without inventing extra bottom space", () => {
    const layout: SliderSkeletonNode = {
      kind: "slider",
      direction: "row",
      item: {
        kind: "col",
        style: {
          padding: "16px 16px 0 16px",
        },
        children: [
          {
            kind: "rect",
            style: {
              width: "100%",
              aspectRatio: 1,
            },
          },
        ],
      },
      itemWrapStyle: {
        width: 200,
      },
    };

    const rowHeight = buildRowHeightFromSkeletonSpecCssExpr(layout, 1, "peek");
    expect(rowHeight).toContain("calc(200px - calc(16px + 16px))");
    expect(rowHeight).toContain("+ 16px");
  });

  test("keeps center-first spacer width based on outer slot widths", () => {
    const layout: SliderSkeletonNode = {
      kind: "slider",
      direction: "row",
      style: {
        gap: 10,
      },
      item: {
        kind: "rect",
        style: {
          width: "100%",
          height: "100%",
        },
      },
      itemWrapStyle: {
        width: 100,
        height: 80,
        border: "2px solid #cbd5e1",
      },
      slots: [
        {},
        {
          itemWrapStyle: {
            width: 120,
            border: "6px solid #0f172a",
          },
        },
        {
          itemWrapStyle: {
            width: 140,
            border: "10px solid #1d4ed8",
          },
        },
      ],
    };

    expect(buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr(layout, 3, "peek")).toBe(
      "calc(120px + 140px + 10px)"
    );
  });

  test("renders wrapper border and border-box sizing inline", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        activeDotIndex: 2,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "rect",
              style: {
                aspectRatio: 1,
              },
            },
            itemWrapStyle: {
              width: 180,
              border: "1px solid #cbd5e1",
            },
          },
        },
      })
    );

    expect(markup).toContain('data-rmg-skel-slot="1"');
    expect(markup).toContain("border:1px solid #cbd5e1");
    expect(markup).toContain("box-sizing:border-box");
  });

  test("renders native slider dots skeleton with restorable active state", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        activeDotIndex: 2,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "rect",
              style: {
                width: "100%",
                height: 120,
              },
            },
            overlays: [
              {
                kind: "sliderDots",
                count: 3,
                dotStyle: {
                  width: 10,
                  height: 10,
                },
                activeStyle: {
                  backgroundColor: "#93c5fd",
                },
                inactiveStyle: {
                  backgroundColor: "#e2e8f0",
                },
                shimmer: {
                  enabled: false,
                },
              },
            ],
          },
        },
      })
    );

    expect(markup).toContain('data-rmg-skel-slider-dots="true"');
    expect(markup).toContain('data-rmg-skel-slider-dot="0"');
    expect(markup).toContain('data-rmg-skel-slider-dot="2"');
    expect(markup).toContain(
      'data-rmg-skel-slider-dot="2" data-rmg-skel-dot-active="true"'
    );
    expect(markup).toContain("--rmg-skel-shimmer-enabled:0");
  });

  test("adds row height compensation to row and initial height expressions", () => {
    const layout: SliderSkeletonNode = {
      kind: "slider",
      direction: "row",
      rowHeightCompensation: {
        0: 12.5,
        900: 24,
      },
      item: {
        kind: "rect",
        style: {
          width: "100%",
          height: 140,
        },
      },
    };

    expect(buildRowHeightFromSkeletonSpecCssExpr(layout, 1, "fit", 0)).toBe(
      "calc(140px + 12.5px)"
    );
    expect(buildInitialHeightFromSkeletonSpecCssExpr(layout, 1, "fit", 900)).toBe(
      "calc(140px + 24px)"
    );
    expect(collectResponsiveSliderCompensationBreakpoints(layout)).toEqual([900]);
  });

  test("uses an internal responsive scope when rendered standalone", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            style: {
              0: {
                gap: 12,
              },
              900: {
                gap: 24,
              },
            },
            item: {
              kind: "text",
              barHeight: 16,
              lineHeight: 1.25,
              lines: {
                0: 3,
                900: 2,
              },
            },
          },
        },
      })
    );

    const scopeMatch = markup.match(/data-rmg-slider-skel-scope="([^"]+)"/);
    expect(scopeMatch?.[1]).toBeTruthy();

    const scopeSelector = `[data-rmg-slider-skel-scope="${scopeMatch![1]}"]`;
    expect(markup).toContain(`${scopeSelector} [data-rmg-skel-node="n1"]`);
    expect(markup).toContain(`@media (min-width:900px){${scopeSelector} [data-rmg-skel-node="n1"]`);
  });

  test("renders responsive container base styles through CSS so later breakpoints do not need !important", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "rect",
              style: {
                width: "100%",
                height: 100,
              },
            },
            children: [
              {
                kind: "col",
                style: {
                  0: {
                    width: "100%",
                    padding: "14px 0 0",
                  },
                  768: {
                    width: "100%",
                    padding: "20px 0 0",
                  },
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: 160,
                      height: 32,
                    },
                  },
                ],
              },
            ],
          },
        },
      })
    );

    const scopeMatch = markup.match(/data-rmg-slider-skel-scope="([^"]+)"/);
    expect(scopeMatch?.[1]).toBeTruthy();

    const scopeSelector = `[data-rmg-slider-skel-scope="${scopeMatch![1]}"]`;
    const childNodeId = markup.match(/data-rmg-skel-node="(n\d+)" class="[^"]*sliderSkeletonGroup/)?.[1];
    expect(childNodeId).toBeTruthy();

    expect(markup).toContain(
      `${scopeSelector} [data-rmg-skel-node="${childNodeId}"]{padding:14px 0 0;width:100%;}`
    );
    expect(markup).toContain(
      `@media (min-width:768px){${scopeSelector} [data-rmg-skel-node="${childNodeId}"]{padding:20px 0 0;width:100%;}}`
    );
    expect(markup).toMatch(
      new RegExp(
        `<div data-rmg-skel-node="${childNodeId}"[^>]*style="display:flex;flex-direction:column"`
      )
    );
    expect(markup).not.toMatch(
      new RegExp(
        `<div data-rmg-skel-node="${childNodeId}"[^>]*style="[^"]*padding:14px 0 0`
      )
    );
  });

  test("renders responsive rect nodes with a scoped node id so shape breakpoint CSS can apply", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "rect",
              style: {
                width: "100%",
                height: 100,
              },
            },
            children: [
              {
                kind: "rect",
                style: {
                  0: {
                    width: 160,
                    height: 32,
                    borderRadius: 999,
                    alignSelf: "center",
                  },
                  768: {
                    width: 111,
                    height: 32,
                    borderRadius: 999,
                    alignSelf: "center",
                  },
                },
              },
            ],
          },
        },
      })
    );

    const scopeMatch = markup.match(/data-rmg-slider-skel-scope="([^"]+)"/);
    expect(scopeMatch?.[1]).toBeTruthy();

    const rectNodeId = markup.match(
      /<div data-rmg-skel-node="(n\d+)" class="[^"]*_sliderSkeleton_[^"]*"/
    )?.[1];
    expect(rectNodeId).toBeTruthy();

    const scopeSelector = `[data-rmg-slider-skel-scope="${scopeMatch![1]}"]`;
    expect(markup).toContain(
      `${scopeSelector} [data-rmg-skel-node="${rectNodeId}"]{inline-size:160px;width:160px;height:32px;--rmg-skel-radius:999px;align-self:center;}`
    );
    expect(markup).toContain(
      `@media (min-width:768px){${scopeSelector} [data-rmg-skel-node="${rectNodeId}"]{inline-size:111px;width:111px;height:32px;--rmg-skel-radius:999px;align-self:center;}}`
    );
  });

  test("renders wrapper border radius as an actual wrapper style", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "col",
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: 1,
                  },
                },
              ],
            },
            itemWrapStyle: {
              width: 180,
              border: "1px solid #cbd5e1",
              borderRadius: 24,
            },
          },
        },
      })
    );

    expect(markup).toContain("border-radius:24px");
    expect(markup).toContain("overflow:hidden");
  });

  test("renders wrapper box shadow through the fading wrapper variable", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "rect",
              style: {
                aspectRatio: 1,
              },
            },
            itemWrapStyle: {
              width: 180,
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
            },
          },
        },
      })
    );

    expect(markup).toContain("--rmg-slider-skel-wrap-shadow:0 12px 28px rgba(15, 23, 42, 0.18)");
    expect(markup).not.toContain("box-shadow:0 12px 28px rgba(15, 23, 42, 0.18)");
  });

  test("renders wrapper background color on the item shell without overriding child skeleton fills", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "col",
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
                  barHeight: 16,
                  lineHeight: 1.2,
                },
                {
                  kind: "text",
                  barHeight: 14,
                  lineHeight: 1.1,
                },
              ],
            },
            itemWrapStyle: {
              width: 220,
              backgroundColor: "#f8fafc",
            },
          },
        },
      })
    );

    expect(markup.match(/background-color:#f8fafc/g) ?? []).toHaveLength(1);
    expect(markup).not.toContain("--rmg-skel-bg:#f8fafc");
  });

  test("can render natural-height peek slots with overlay controls", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 3,
        maxSlots: 3,
        spec: {
          mode: "peek",
          layout: {
            kind: "slider",
            direction: "row",
            itemStretch: false,
            style: {
              gap: 20,
              justify: "center",
            },
            item: {
              kind: "rect",
              style: {
                width: "100%",
                height: 120,
              },
            },
            itemWrapStyle: {
              width: 240,
              backgroundColor: "#ffffff",
            },
            slots: [
              {
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: 100,
                  },
                },
              },
              {},
              {
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: 160,
                  },
                },
              },
            ],
            overlays: [
              {
                kind: "row",
                style: {
                  position: "absolute",
                  left: "50%",
                  bottom: 10,
                  zIndex: 3,
                  width: "max-content",
                  padding: "4px 8px",
                  borderRadius: 999,
                  backgroundColor: "rgba(148, 163, 184, 0.48)",
                  transform: "translateX(-50%)",
                },
                children: [
                  {
                    kind: "circle",
                    style: {
                      width: 14,
                      height: 14,
                      margin: 5,
                    },
                    shimmer: {
                      enabled: false,
                    },
                  },
                ],
              },
            ],
          },
        },
      })
    );

    expect(markup).toContain('data-rmg-skel-part="overlays"');
    expect(markup).toContain("align-self:flex-start");
    expect(markup).toContain("height:auto");
    expect(markup).toContain("position:absolute");
    expect(markup).toContain("bottom:10px");
    expect(markup).toContain("width:max-content");
    expect(markup).toContain("transform:translateX(-50%)");
  });

  test("renders wrapped text nodes as multiple line bars with a shortened last line", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
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
      })
    );

    expect(markup).toContain('data-rmg-skel-text="true"');
    expect(markup.match(/data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(2);
    expect(markup.match(/width:68%/g) ?? []).toHaveLength(1);
  });

  test("renders max-content text bars with concrete widths", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "text",
              barHeight: 12,
              lineHeight: 1.25,
              lines: 1,
              barWidth: "81px",
              style: {
                width: "max-content",
                maxWidth: "100%",
                borderRadius: 999,
              },
            },
          },
        },
      })
    );

    expect(markup).toContain("width:max-content");
    expect(markup).toContain("width:81px");
    expect(markup).toContain("max-width:81px");
  });

  test("keeps wrapped text height math identical for slider row and initial height CSS", () => {
    const layout: SliderSkeletonNode = {
      kind: "slider",
      direction: "row",
      item: {
        kind: "text",
        barHeight: 16,
        lineHeight: 1.5,
        lines: 2,
      },
    };

    expect(buildRowHeightFromSkeletonSpecCssExpr(layout, 1, "fit")).toBe("48px");
    expect(buildInitialHeightFromSkeletonSpecCssExpr(layout, 1, "fit")).toBe("48px");
  });

  test("can use a specific visible slot for row height", () => {
    const layout: SliderSkeletonNode = {
      kind: "slider",
      direction: "row",
      initialHeightSlot: 1,
      item: {
        kind: "rect",
        style: {
          width: "100%",
          height: 180,
        },
      },
      slots: [
        {
          item: {
            kind: "rect",
            style: {
              width: "100%",
              height: 220,
            },
          },
        },
        {
          item: {
            kind: "rect",
            style: {
              width: "100%",
              height: 140,
            },
          },
        },
        {
          item: {
            kind: "rect",
            style: {
              width: "100%",
              height: 260,
            },
          },
        },
      ],
    };

    expect(buildRowHeightFromSkeletonSpecCssExpr(layout, 3, "peek")).toBe("140px");
    expect(buildInitialHeightFromSkeletonSpecCssExpr(layout, 3, "peek")).toBe("140px");
  });

  test("renders responsive text line CSS and a custom trailing line width", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
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
      })
    );

    expect(markup.match(/<div data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(3);
    expect(markup).toContain("@media (min-width:767px)");
    expect(markup).toContain(
      "@supports (font: -apple-system-body) and (-webkit-hyphens: none)"
    );
    expect(markup).toContain(
      'data-rmg-skel-text-line="true"]{display:none !important;height:16px !important;}'
    );
    expect(markup).toContain("@media (min-width:1200px)");
    expect(markup).toContain("nth-child(1){max-width:56% !important;}");
  });

  test("emits Safari text metrics in scoped slider shell height CSS", () => {
    const css = buildScopedInitialHeightCss({
      scopeId: "slider-shell-safari",
      skeletonSpec: {
        mode: "fit",
        layout: {
          kind: "slider",
          direction: "row",
          item: {
            kind: "text",
            barHeight: 13,
            lineHeight: 1.62,
            lines: 3,
          },
        },
      },
      responsiveCount: 1,
      fallbackCount: 1,
      breakpointMap: BREAKPOINT_MAP,
    });

    expect(css).toContain("--rmg-slider-row-height:63.140625px;");
    expect(css).toContain(
      "@supports (font: -apple-system-body) and (-webkit-hyphens: none)"
    );
    expect(css).toContain("--rmg-slider-row-height:63px;");
    expect(css).toContain("--rmg-slider-initial-height:63px;");
  });

  test("locks the loading shell to slider skeleton height while content settles", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        SliderSkeleton,
        {
          ready: false,
          layout: {
            mode: "fit",
            layout: {
              kind: "slider",
              direction: "row",
              item: {
                kind: "rect",
                style: {
                  width: "100%",
                  height: 120,
                },
              },
            },
          },
        },
        React.createElement("div", { style: { height: 999 } }, "content")
      )
    );

    expect(markup).toContain('data-rmg-skeleton-wrapper="true"');
    expect(markup).toContain('data-rmg-skeleton-layout-owner="content"');
    expect(markup).toContain(
      "height:var(--rmg-slider-initial-height, var(--rmg-slider-height, 320px))"
    );
    expect(markup).toContain(
      "min-height:var(--rmg-slider-initial-height, var(--rmg-slider-height, 320px))"
    );
    expect(markup).toContain("overflow:hidden");
  });

  test("emits slider restore script before skeleton card markup", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        SliderSkeleton,
        {
          ready: false,
          layout: {
            mode: "fit",
            layout: {
              kind: "slider",
              direction: "row",
              item: {
                kind: "rect",
                style: {
                  width: "100%",
                  height: 120,
                },
              },
            },
          },
          restore: {
            kind: "slider",
            enabled: true,
            key: "restore-order",
            slider: { handleRef: React.createRef() },
            itemCount: 3,
            visibleCount: 1,
          },
        },
        React.createElement("div", null, "content")
      )
    );

    const restoreScriptIndex = markup.indexOf("rmg_slider_restore_");
    const cardIndex = markup.indexOf('data-rmg-skel-part="overlay"');

    expect(restoreScriptIndex).toBeGreaterThan(-1);
    expect(cardIndex).toBeGreaterThan(-1);
    expect(restoreScriptIndex).toBeLessThan(cardIndex);
  });

  test("preserves source responsive metrics while rendering cached text widths", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "text",
              textId: "body",
              barHeight: 16,
              lineHeight: {
                0: 1.2,
                900: 1.5,
              },
              lines: {
                0: 4,
                900: 1,
              },
              style: {
                width: "88%",
              },
            },
          },
        },
        cacheSnapshot: {
          version: 1,
          key: "slider-demo",
          scopeId: "scope-a",
          kind: "slider",
          createdAt: 1000,
          widthBucketMin: 900,
          viewportWidth: 1200,
          text: {
            body: {
              lines: 2,
              lineWidthsPx: [121, 88],
              barHeight: 12,
              lineHeight: 9,
              containerWidthPx: 900,
            },
          },
        },
      })
    );

    expect(markup.match(/<div data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(1);
    expect(markup).toContain('data-rmg-skel-text-id="body"');
    expect(markup).not.toContain("@media");
    expect(markup).not.toContain("@container");
    expect(markup).toContain("height:24px");
    expect(markup).toContain("max-height:24px");
    expect(markup).toContain("height:16px");
    expect(markup).not.toContain("height:12px");
    expect(markup).not.toContain("height:36px");
    expect(markup).not.toContain("height:216px");
    expect(markup).toContain("max-width:121px");
    expect(markup).not.toContain("max-width:88px");
  });

  test("uses cached line counts only when source text omits lines", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "text",
              textId: "body",
              barHeight: 16,
              lineHeight: 1.5,
              style: {
                width: "88%",
              },
            },
          },
        },
        cacheSnapshot: {
          version: 1,
          key: "slider-demo",
          scopeId: "scope-a",
          kind: "slider",
          createdAt: 1000,
          widthBucketMin: 900,
          viewportWidth: 1200,
          text: {
            body: {
              lines: 2,
              lineWidthsPx: [121, 88],
              barHeight: 12,
              lineHeight: 9,
              containerWidthPx: 900,
            },
          },
        },
      })
    );

    expect(markup.match(/<div data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(2);
    expect(markup).toContain("height:48px");
    expect(markup).toContain("max-height:48px");
    expect(markup).toContain("height:16px");
    expect(markup).not.toContain("@media");
    expect(markup).not.toContain("@container");
    expect(markup).not.toContain("height:216px");
    expect(markup).not.toContain("height:12px");
    expect(markup).toContain("max-width:121px");
    expect(markup).toContain("max-width:88px");
  });

  test("uses snapshot viewport width for source viewport-responsive text", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "text",
              textId: "body",
              barHeight: 10,
              lineHeight: {
                0: 1,
                900: 3,
              },
              lines: 1,
            },
          },
        },
        cacheSnapshot: {
          version: 1,
          key: "slider-demo",
          scopeId: "scope-a",
          kind: "slider",
          createdAt: 1000,
          widthBucketMin: 900,
          viewportWidth: 1200,
          text: {
            body: {
              lines: 2,
              lineWidthsPx: [121, 88],
              barHeight: 5,
              lineHeight: 9,
              containerWidthPx: 500,
            },
          },
        },
      })
    );

    expect(markup).toContain("max-height:30px");
    expect(markup).not.toContain("max-height:10px");
  });

  test("uses cached container width for container-responsive source text", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "text",
              textId: "body",
              responsiveBy: "container",
              barHeight: 10,
              lineHeight: {
                0: 1,
                900: 3,
              },
              lines: 1,
            },
          },
        },
        cacheSnapshot: {
          version: 1,
          key: "slider-demo",
          scopeId: "scope-a",
          kind: "slider",
          createdAt: 1000,
          widthBucketMin: 900,
          viewportWidth: 1200,
          layoutWidthPx: 1200,
          text: {
            body: {
              lines: 2,
              lineWidthsPx: [121, 88],
              barHeight: 5,
              lineHeight: 9,
              containerWidthPx: 500,
            },
          },
        },
      })
    );

    expect(markup).toContain("max-height:10px");
    expect(markup).not.toContain("max-height:30px");
  });

  test("applies slider cache as a first-paint render context", () => {
    const layout = {
      mode: "fit" as const,
      layout: {
        kind: "slider" as const,
        direction: "row" as const,
        item: {
          kind: "text" as const,
          textId: "body",
          barHeight: 16,
          lineHeight: 1.5,
          lines: 1,
        },
      },
    };
    const scopeId = buildStableScopeId("skel_", {
      layout,
      breakpoints: BREAKPOINT_MAP,
      backgroundColor: undefined,
      radius: undefined,
      shimmer: undefined,
      disableShimmer: undefined,
    });
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeleton, {
        ready: false,
        layout,
        cache: {
          key: "slider-demo",
          snapshot: {
            version: 1,
            key: "slider-demo",
            scopeId,
            kind: "slider",
            createdAt: Date.now(),
            widthBucketMin: 0,
            viewportWidth: 1200,
            text: {
              body: {
                lines: 2,
                lineWidthsPx: [121, 88],
                barHeight: 12,
                lineHeight: 9,
                containerWidthPx: 900,
              },
            },
          },
        },
      })
    );

    expect(markup).toContain("--rmg-slider-row-height:24px");
    expect(markup).toContain("max-width:121px");
    expect(markup).not.toContain("@media");
    expect(markup).not.toContain("@container");
    expect(markup).not.toContain("height:216px");
  });

  test("cached wrapper height CSS resolves only the current breakpoint", () => {
    const layout = {
      mode: "fit" as const,
      layout: {
        kind: "slider" as const,
        direction: "row" as const,
        item: {
          kind: "text" as const,
          textId: "body",
          barHeight: 16,
          lineHeight: {
            0: 1,
            900: 2,
          },
          lines: 1,
        },
      },
    };
    const scopeId = buildStableScopeId("skel_", {
      layout,
      breakpoints: BREAKPOINT_MAP,
      backgroundColor: undefined,
      radius: undefined,
      shimmer: undefined,
      disableShimmer: undefined,
    });
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeleton, {
        ready: false,
        layout,
        cache: {
          key: "slider-demo",
          snapshot: {
            version: 1,
            key: "slider-demo",
            scopeId,
            kind: "slider",
            createdAt: Date.now(),
            widthBucketMin: 0,
            viewportWidth: 1200,
            text: {
              body: {
                lines: 3,
                lineWidthsPx: [121, 88, 72],
                barHeight: 8,
                lineHeight: 9,
                containerWidthPx: 500,
              },
            },
          },
        },
      })
    );

    expect(markup).toContain("--rmg-slider-row-height:32px");
    expect(markup).not.toContain("--rmg-slider-row-height:16px");
    expect(markup).not.toContain("@media");
    expect(markup).not.toContain("@container");
  });

  test("seeds cache-backed restore as initial skeleton and child slider state", () => {
    const layout = {
      mode: "fit" as const,
      layout: {
        kind: "slider" as const,
        direction: "row" as const,
        item: {
          kind: "rect" as const,
          style: {
            width: "100%",
            height: 120,
          },
        },
      },
    };
    function ChildSlider(props: { initialIndex?: number }) {
      return React.createElement("div", {
        "data-child-initial-index": props.initialIndex ?? "",
      });
    }
    const scopeId = buildStableScopeId("skel_", {
      layout,
      breakpoints: BREAKPOINT_MAP,
      backgroundColor: undefined,
      radius: undefined,
      shimmer: undefined,
      disableShimmer: undefined,
    });
    const markup = renderToStaticMarkup(
      React.createElement(
        SliderSkeleton,
        {
          ready: false,
          layout,
          cache: {
            key: "slider-auto-height",
            routeKey: "/demos?demo=slider-auto-height",
            snapshot: {
              version: 1,
              key: "slider-auto-height",
              scopeId,
              kind: "slider",
              routeKey: "/demos?demo=slider-auto-height",
              createdAt: Date.now(),
              widthBucketMin: 0,
              viewportWidth: 1200,
              slider: {
                restore: {
                  version: 1,
                  index: 2,
                  heightPx: 461,
                  viewportWidth: 1200,
                  slideCount: 5,
                  skeletonSlotCount: 5,
                  timestamp: Date.now(),
                  scrollY: 0,
                  scrollMax: 0,
                  wasAtBottom: false,
                  storageKeyId: "slider-auto-height",
                  routeKey: "/demos?demo=slider-auto-height",
                  scopeId,
                },
              },
              text: {},
            },
          },
          restore: {
            kind: "slider",
            enabled: true,
            key: "slider-auto-height",
            slider: { handleRef: React.createRef() },
            itemCount: 5,
            visibleCount: 3,
            loop: true,
            activeSlotOffset: 1,
          },
        },
        React.createElement(ChildSlider)
      )
    );

    expect(markup).not.toContain("data-rmg-slider-restore-active");
    expect(markup).not.toContain("data-rmg-slider-restore-static");
    expect(markup).not.toContain("data-rmg-slider-restore-style");
    expect(markup).not.toContain("rmg_slider_restore_");
    expect(markup).not.toContain('"heightPx":461');
    expect(markup).toContain('data-child-initial-index="2"');
    expect(markup).toContain("--rmg-slider-initial-height:461px!important");
    expect(markup).toContain("--rmg-slider-row-height:461px!important");
    expect(markup).toContain("--rmg-slider-row-height:max(120px");
    expect(markup).toContain('[data-rmg-skel-slot="3"]');
  });

  test("does not emit cache-backed restore CSS for first-slide no-op state", () => {
    const layout = {
      mode: "fit" as const,
      layout: {
        kind: "slider" as const,
        direction: "row" as const,
        item: {
          kind: "rect" as const,
          style: {
            width: "100%",
            height: 120,
          },
        },
      },
    };
    const scopeId = buildStableScopeId("skel_", {
      layout,
      breakpoints: BREAKPOINT_MAP,
      backgroundColor: undefined,
      radius: undefined,
      shimmer: undefined,
      disableShimmer: undefined,
    });
    const markup = renderToStaticMarkup(
      React.createElement(
        SliderSkeleton,
        {
          ready: false,
          layout,
          cache: {
            key: "slider-auto-height",
            routeKey: "/demos?demo=slider-auto-height",
            snapshot: {
              version: 1,
              key: "slider-auto-height",
              scopeId,
              kind: "slider",
              routeKey: "/demos?demo=slider-auto-height",
              createdAt: Date.now(),
              widthBucketMin: 0,
              viewportWidth: 1200,
              slider: {
                restore: {
                  version: 1,
                  index: 0,
                  heightPx: 461,
                  viewportWidth: 1200,
                  slideCount: 5,
                  skeletonSlotCount: 5,
                  timestamp: Date.now(),
                  scrollY: 0,
                  scrollMax: 0,
                  wasAtBottom: false,
                  storageKeyId: "slider-auto-height",
                  routeKey: "/demos?demo=slider-auto-height",
                  scopeId,
                },
              },
              text: {},
            },
          },
          restore: {
            kind: "slider",
            enabled: true,
            key: "slider-auto-height",
            slider: { handleRef: React.createRef() },
            itemCount: 5,
            visibleCount: 3,
            loop: true,
            activeSlotOffset: 1,
          },
        },
        React.createElement("div", null, "content")
      )
    );

    expect(markup).not.toContain("data-rmg-slider-restore-static");
    expect(markup).not.toContain("data-rmg-slider-restore-style");
    expect(markup).not.toContain("rmg_slider_restore_");
    expect(markup).not.toContain('"heightPx":461');
  });

  test("updates the cache restore payload after a stable slider index change", async () => {
    const layout = {
      mode: "fit" as const,
      layout: {
        kind: "slider" as const,
        direction: "row" as const,
        item: {
          kind: "rect" as const,
          style: {
            width: "100%",
            height: 120,
          },
        },
      },
    };
    const scopeId = buildStableScopeId("skel_", {
      layout,
      breakpoints: BREAKPOINT_MAP,
      backgroundColor: undefined,
      radius: undefined,
      shimmer: undefined,
      disableShimmer: undefined,
    });
    const cacheKey = "slider-live-restore";
    const cookieName = getSkeletonCacheCookieName(cacheKey);
    const routeKey = `${window.location.pathname}${window.location.search}`;
    let index = 0;
    let height = 461;
    const indexSubscribers = new Set<
      (i: number, meta: { mode: "instant" }) => void
    >();
    const readySubscribers = new Set<(nodes: HTMLElement[]) => void>();
    const viewport = document.createElement("div");
    viewport.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 400,
        bottom: height,
        width: 400,
        height,
        toJSON: () => ({}),
      }) as DOMRect;
    const handle = {
      getIndex: () => index,
      setIndex: (nextIndex: number) => {
        index = nextIndex;
      },
      isReady: () => true,
      getViewportNode: () => viewport,
      onIndexChange: (cb: (i: number, meta: { mode: "instant" }) => void) => {
        indexSubscribers.add(cb);
        return () => indexSubscribers.delete(cb);
      },
      onReady: (cb: (nodes: HTMLElement[]) => void) => {
        readySubscribers.add(cb);
        return () => readySubscribers.delete(cb);
      },
    } as unknown as SliderHandle;
    const handleRef = { current: null } as React.MutableRefObject<SliderHandle | null>;
    const container = document.createElement("div");
    let root: Root | null = null;

    document.cookie = `${cookieName}=; path=/; max-age=0`;
    document.cookie = `${cookieName}=${encodeURIComponent(
      serializeSkeletonCacheSnapshot({
        version: 1,
        key: cacheKey,
        scopeId,
        kind: "slider",
        routeKey,
        createdAt: Date.now(),
        widthBucketMin: 0,
        viewportWidth: window.innerWidth,
        slider: {
          restore: {
            version: 1,
            index: 0,
            heightPx: 461,
            viewportWidth: window.innerWidth,
            slideCount: 5,
            skeletonSlotCount: 5,
            timestamp: Date.now(),
            scrollY: 0,
            scrollMax: 0,
            wasAtBottom: false,
            storageKeyId: cacheKey,
            routeKey,
            scopeId,
          },
        },
        text: {},
      })
    )}; path=/`;

    try {
      root = createRoot(container);

      await React.act(async () => {
        root?.render(
          React.createElement(
            SliderSkeleton,
            {
              ready: true,
              layout,
              cache: {
                key: cacheKey,
              },
              restore: {
                kind: "slider",
                enabled: true,
                key: cacheKey,
                slider: { handleRef },
                itemCount: 5,
                visibleCount: 3,
                loop: true,
                activeSlotOffset: 1,
              },
            },
            React.createElement("div", null, "content")
          )
        );
        await wait(80);
      });

      handleRef.current = handle;
      await React.act(async () => {
        await wait(350);
      });
      expect(indexSubscribers.size).toBeGreaterThan(0);

      index = 3;
      height = 552;
      await React.act(async () => {
        indexSubscribers.forEach((cb) => cb(3, { mode: "instant" }));
        await wait(120);
      });

      const raw = document.cookie
        .split("; ")
        .find((part) => part.startsWith(`${cookieName}=`))
        ?.split("=")[1];
      const parsed = parseSkeletonCacheCookie(raw ? decodeURIComponent(raw) : null);

      expect(parsed?.slider?.restore?.index).toBe(3);
      expect(parsed?.slider?.restore?.heightPx).toBe(552);
      expect(parsed?.text).toEqual({});
    } finally {
      await React.act(async () => {
        root?.unmount();
      });
      document.cookie = `${cookieName}=; path=/; max-age=0`;
    }
  });

  test("emits responsive CSS for shape, text style, and media tile styles with custom aliases", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        breakpoints: CUSTOM_BREAKPOINTS,
        spec: {
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "col",
              style: {
                gap: 12,
              },
              children: [
                {
                  kind: "rect",
                  style: {
                    xs: {
                      width: "100%",
                      height: 120,
                    },
                    tablet: {
                      width: "100%",
                      height: 180,
                    },
                  },
                },
                {
                  kind: "text",
                  barHeight: 16,
                  lineHeight: 1.5,
                  lines: 2,
                  style: {
                    xs: {
                      width: "82%",
                      backgroundColor: "#e2e8f0",
                      borderRadius: 12,
                    },
                    tablet: {
                      width: "64%",
                      backgroundColor: "#cbd5e1",
                      borderRadius: 20,
                    },
                  },
                },
                {
                  kind: "media",
                  count: 2,
                  direction: "row",
                  tile: {
                    style: {
                      xs: {
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                      },
                      tablet: {
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      })
    );

    expect(markup).toContain("@media (min-width:840px)");
    expect(markup).toContain("height:180px;");
    expect(markup).toContain("inline-size:64%;width:64%;");
    expect(markup).toContain(
      'data-rmg-skel-text-line="true"]{--rmg-skel-bg:#cbd5e1;--rmg-skel-radius:20px;}'
    );
    expect(markup.match(/<div data-rmg-skel-media-tile="true"/g) ?? []).toHaveLength(2);
    expect(markup).toContain(
      'data-rmg-skel-media-tile="true"]{inline-size:56px;width:56px;height:56px;--rmg-skel-radius:18px;}'
    );
  });

  test("serializes shared shimmer vars for slider skeletons, including blur and disable", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SliderSkeletonCard, {
        count: 1,
        maxSlots: 1,
        spec: {
          shimmer: {
            enabled: false,
            blurPx: 6,
            timing: "ease-in-out",
            opacity: 0.6,
            c1: "rgba(255,255,255,0.12)",
            c2: "rgba(255,255,255,0.32)",
            c3: "rgba(255,255,255,0.12)",
          },
          layout: {
            kind: "slider",
            direction: "row",
            item: {
              kind: "rect",
              style: {
                width: "100%",
                aspectRatio: 1,
              },
            },
          },
        },
      })
    );

    expect(markup).toContain("--rmg-skel-shimmer-enabled:0");
    expect(markup).toContain("--rmg-skel-shimmer-blur:6px");
    expect(markup).toContain("--rmg-skel-shimmer-filter:blur(6px)");
    expect(markup).toContain("--rmg-skel-shimmer-timing:ease-in-out");
  });
});
