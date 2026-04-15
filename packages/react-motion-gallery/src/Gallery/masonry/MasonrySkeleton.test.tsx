import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import {
  MasonrySkeletonCard,
  resolveActiveFlexStateKey,
} from "./MasonrySkeleton";

describe("MasonrySkeleton layout and text nodes", () => {
  test("resolves the active responsive masonry variant from viewport width", () => {
    expect(
      resolveActiveFlexStateKey(
        [
          { minWidth: 0, columns: 1, gapPx: 12, key: "c1_g12" },
          { minWidth: 720, columns: 2, gapPx: 12, key: "c2_g12" },
          { minWidth: 1140, columns: 3, gapPx: 18, key: "c3_g18" },
        ],
        1280
      )
    ).toBe("c3_g18");

    expect(
      resolveActiveFlexStateKey(
        [
          { minWidth: 0, columns: 1, gapPx: 12, key: "c1_g12" },
          { minWidth: 720, columns: 2, gapPx: 12, key: "c2_g12" },
          { minWidth: 1140, columns: 3, gapPx: 18, key: "c3_g18" },
        ],
        900
      )
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
      })
    );

    expect(markup).toContain("legacy-skeleton");
    expect(markup).toContain("height:192px");
    expect(markup).not.toContain('data-rmg-skel-text="true"');
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
              fontSize: 16,
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
    expect(markup).toContain("padding:12px");
    expect(markup).toContain("border-radius:18px");
    expect(markup).toContain("box-shadow:0 8px 24px");
    expect(markup).toContain(sharedSkeletonStyles.skelCardShimmer);
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
              fontSize: 12,
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
                      fontSize: 14,
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
      })
    );

    expect(markup).toContain("min-height:360px");
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
                  fontSize: 16,
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
      })
    );

    expect(markup).toContain(sharedSkeletonStyles.skelCardShimmer);
    expect(markup).not.toContain(sharedSkeletonStyles.skelShimmer);
    expect(markup).toContain("--rmg-skel-card-shimmer-enabled:0");
    expect(markup).not.toContain("--rmg-skel-shimmer-duration:933ms");
    expect(markup).not.toContain("--rmg-skel-shimmer-opacity:0.41");
  });

  test("renders responsive text CSS and respects explicit heights with layout enabled", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonrySkeletonCard, {
        count: 1,
        heightsPx: [300],
        spec: {
          layout: {
            kind: "masonry",
            item: {
              kind: "text",
              fontSize: 16,
              lineHeight: 1.5,
              lines: {
                0: 3,
                767: 2,
                1200: 1,
              },
              lineWidth: "56%",
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
    expect(markup).toContain("nth-child(n+3){display:none;}");
    expect(markup).toContain("@media (min-width:1200px)");
    expect(markup).toContain("nth-child(1){width:56%;}");
    expect(markup).toContain("min-height:300px");
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
                  fontSize: 18,
                  lineHeight: 1.35,
                  lines: 2,
                  style: {
                    width: "88%",
                  },
                },
                {
                  kind: "text",
                  fontSize: 14,
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
      })
    );

    expect(markup).toContain("min-height:370px");
    expect(markup).not.toContain("min-height:132px");
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
                  fontSize: 18,
                  lineHeight: 1.35,
                  lines: 2,
                  style: {
                    width: "88%",
                  },
                },
                {
                  kind: "text",
                  fontSize: 14,
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
      })
    );

    expect(markup).toContain("min-height:425px");
    expect(markup).not.toContain("min-height:132px");
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
              fontSize: 14,
              lineHeight: 1.5,
              style: {
                width: "72%",
              },
            },
          },
        },
      })
    );

    expect(markup.match(/data-rmg-skel-text="true"/g) ?? []).toHaveLength(2);
    expect(markup).toContain('data-rmg-mskel-variant="c4_g8"');
  });
});
