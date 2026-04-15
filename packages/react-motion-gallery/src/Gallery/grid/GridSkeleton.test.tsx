import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import { GridSkeletonCard } from "./GridSkeleton";

const CUSTOM_BREAKPOINTS = {
  ...BREAKPOINT_MAP,
  tablet: 840,
};

describe("GridSkeleton text nodes", () => {
  test("renders wrapped text as multiple line bars with a shortened last line", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 1,
        spec: {
          layout: {
            kind: "grid",
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
    expect(markup.match(/width:68%/g) ?? []).toHaveLength(1);
  });

  test("keeps single-line text nodes as a single rendered bar", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 1,
        spec: {
          layout: {
            kind: "grid",
            item: {
              kind: "text",
              fontSize: 14,
              lineHeight: 1.5,
              style: {
                width: "50%",
              },
            },
          },
        },
      })
    );

    expect(markup.match(/data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(1);
  });

  test("renders responsive text line CSS and a custom trailing line width", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 1,
        spec: {
          layout: {
            kind: "grid",
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
  });

  test("keeps itemWrapStyle behavior unchanged for grid skeleton items", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 1,
        spec: {
          layout: {
            kind: "grid",
            itemWrapStyle: {
              padding: 12,
              borderRadius: 18,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            },
            item: {
              kind: "text",
              fontSize: 14,
              lineHeight: 1.5,
              style: {
                width: "70%",
              },
            },
          },
        },
      })
    );

    expect(markup).toContain("padding:12px");
    expect(markup).toContain("border-radius:18px");
    expect(markup).toContain("box-shadow:0 8px 24px");
    expect(markup).toContain('data-rmg-skel-text="true"');
  });

  test("supports per-slot grid skeleton item overrides", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 2,
        spec: {
          layout: {
            kind: "grid",
            item: {
              kind: "text",
              fontSize: 14,
              lineHeight: 1.5,
              style: {
                width: "70%",
              },
            },
            slots: [
              {
                item: {
                  kind: "col",
                  style: {
                    gap: 10,
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
                      fontSize: 16,
                      lineHeight: 1.4,
                      lines: 2,
                      style: {
                        width: "82%",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      })
    );

    expect(markup).toContain("height:220px");
    expect(markup.match(/width:82%/g) ?? []).toHaveLength(1);
    expect(markup.match(/width:70%/g) ?? []).toHaveLength(1);
  });

  test("merges base and slot itemWrapStyle values", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 2,
        spec: {
          layout: {
            kind: "grid",
            itemWrapStyle: {
              padding: 12,
              border: "1px solid #e2e8f0",
            },
            item: {
              kind: "text",
              fontSize: 14,
              lineHeight: 1.5,
              style: {
                width: "70%",
              },
            },
            slots: [
              {},
              {
                itemWrapStyle: {
                  borderRadius: 20,
                },
              },
            ],
          },
        },
      })
    );

    expect(markup.match(/padding:12px/g) ?? []).toHaveLength(2);
    expect(markup.match(/border:1px solid #e2e8f0/g) ?? []).toHaveLength(2);
    expect(markup.match(/border-radius:20px/g) ?? []).toHaveLength(1);
  });

  test("emits responsive CSS for slot item overrides", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 2,
        spec: {
          layout: {
            kind: "grid",
            item: {
              kind: "text",
              fontSize: 14,
              lineHeight: 1.5,
              style: {
                width: "70%",
              },
            },
            slots: [
              {},
              {
                item: {
                  kind: "text",
                  fontSize: 16,
                  lineHeight: 1.5,
                  lines: {
                    0: 3,
                    900: 1,
                  },
                  lineWidth: "56%",
                  style: {
                    width: "88%",
                  },
                },
              },
            ],
          },
        },
      })
    );

    expect(markup).toContain("@media (min-width:900px)");
    expect(markup).toContain("nth-child(n+2){display:none;}");
    expect(markup).toContain("nth-child(1){width:56%;}");
  });

  test("emits responsive CSS for shape, text style, and media tile styles with custom aliases", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 1,
        breakpoints: CUSTOM_BREAKPOINTS,
        spec: {
          layout: {
            kind: "grid",
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
                  fontSize: 16,
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

  test("applies shimmer at the grid item wrapper level", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 1,
        spec: {
          shimmer: {
            enabled: false,
          },
          layout: {
            kind: "grid",
            item: {
              kind: "col",
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: 120,
                  },
                  shimmer: {
                    durationMs: 777,
                  },
                },
                {
                  kind: "text",
                  fontSize: 14,
                  lineHeight: 1.5,
                  lines: 2,
                  shimmer: {
                    opacity: 0.23,
                  },
                  style: {
                    width: "70%",
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
    expect(markup).not.toContain("--rmg-skel-shimmer-duration:777ms");
    expect(markup).not.toContain("--rmg-skel-shimmer-opacity:0.23");
  });
});
