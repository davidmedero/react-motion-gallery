import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import { buildMasonrySkeletonPrediction } from "./prediction";
import { MasonrySkeletonCard } from "../skeleton/MasonrySkeleton";

const CUSTOM_BREAKPOINTS = {
  ...BREAKPOINT_MAP,
  tablet: 840,
};

describe("Masonry responsive node styles", () => {
  test("emits responsive CSS for shape, text style, and media tile styles with custom aliases", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        columns: 1,
        gap: 12,
        breakpoints: CUSTOM_BREAKPOINTS,
        spec: {
          layout: {
            kind: "masonry",
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
    expect(markup.match(/<div data-rmg-skel-media-tile="true"/g) ?? []).toHaveLength(4);
    expect(markup).toContain(
      'data-rmg-skel-media-tile="true"]{inline-size:56px;width:56px;height:56px;--rmg-skel-radius:18px;}'
    );
  });

  test("adds prediction variants for responsive base-style breakpoints even when columns stay fixed", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 1,
      columns: 1,
      gap: 12,
      breakpoints: CUSTOM_BREAKPOINTS,
      spec: {
        layout: {
          kind: "masonry",
          item: {
            kind: "rect",
            style: {
              xs: {
                width: "100%",
                height: 100,
              },
              tablet: {
                width: "100%",
                height: 160,
              },
            },
          },
        },
      },
    });

    expect(prediction.states.map((state) => state.minWidth)).toEqual([0, 840]);
    expect(prediction.variants.map((variant) => variant.items[0]?.height)).toEqual([
      100,
      160,
    ]);
  });

  test("uses Safari text metrics for structured masonry prediction", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 1,
      columns: 1,
      gap: 0,
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
    });

    const item = prediction.variants[0]?.items[0];

    expect(item?.height).toBe(64);
    expect(item?.safariHeight).toBe(63);
    expect(item?.heightCssExpr).toBe("var(--rmg-mskel-height-0)");
    expect(item?.safariHeightCssExpr).toBe("var(--rmg-mskel-height-0)");
    expect(prediction.variants[0]?.positionedCssVars?.["--rmg-mskel-height-0"]).toBe(
      "63.140625px"
    );
    expect(
      prediction.variants[0]?.safariPositionedCssVars?.["--rmg-mskel-height-0"]
    ).toBe("63px");
  });
});
