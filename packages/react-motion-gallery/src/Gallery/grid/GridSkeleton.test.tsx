import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import { GridSkeletonCard } from "../skeleton/GridSkeleton";

const CUSTOM_BREAKPOINTS = {
  ...BREAKPOINT_MAP,
  tablet: 840,
};

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

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
    expect(markup.match(/<div data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(2);
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
              barHeight: 14,
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
      'data-rmg-skel-text-line="true"]{display:none !important;height:16px !important;}'
    );
    expect(markup).toContain(
      "nth-child(-n+2){display:block !important;width:100% !important;max-width:100% !important;}"
    );
    expect(markup).toContain("@media (min-width:1200px)");
    expect(markup).toContain("nth-child(1){max-width:56% !important;}");
  });

  test("applies cached text snapshots without responsive text CSS", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 1,
        spec: {
          layout: {
            kind: "grid",
            item: {
              kind: "text",
              textId: "body",
              barHeight: 16,
              lineHeight: 1.5,
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
          key: "grid-demo",
          scopeId: "scope-a",
          kind: "grid",
          createdAt: 1000,
          widthBucketMin: 900,
          viewportWidth: 1200,
          text: {
            body: {
              lines: 2,
              lineWidthsPx: [121, 88],
              barHeight: 12,
              lineHeight: 1.4,
            },
          },
        },
      })
    );

    expect(markup.match(/data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(2);
    expect(markup).toContain('data-rmg-skel-text-id="body"');
    expect(markup).toContain("height:12px");
    expect(markup).toContain("width:121px");
    expect(markup).toContain("width:88px");
    expect(markup).not.toContain("@media (min-width:900px)");
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
              barHeight: 14,
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
    expect(markup).toContain("--rmg-grid-skel-wrap-shadow:0 8px 24px rgba(15, 23, 42, 0.08)");
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
              barHeight: 14,
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
                      barHeight: 16,
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
              barHeight: 14,
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
              barHeight: 14,
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
                  barHeight: 16,
                  lineHeight: 1.5,
                  lines: {
                    0: 3,
                    900: 1,
                  },
                  lastBarWidth: "56%",
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
    expect(markup).toContain(
      'data-rmg-skel-text-line="true"]{display:none !important;height:16px !important;}'
    );
    expect(markup).toContain(
      "nth-child(-n+1){display:block !important;width:100% !important;max-width:100% !important;}"
    );
    expect(markup).toContain("nth-child(1){max-width:56% !important;}");
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
                  barHeight: 14,
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

  test("owns responsive grid track and span CSS inside the grid skeleton renderer", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 2,
        columns: {
          0: 1,
          840: 2,
        },
        gap: {
          0: 8,
          840: 18,
        },
        items: [
          {
            id: "lead",
            span: {
              0: "full",
              840: 2,
            },
          },
          {
            id: "secondary",
          },
        ],
        allowItemSpans: true,
        spec: {
          layout: {
            kind: "grid",
            item: {
              kind: "rect",
              style: {
                width: "100%",
                height: 120,
              },
            },
          },
        },
      })
    );

    expect(markup).toContain('data-rmg-grid-skel-scope="');
    expect(markup).toContain("grid-template-columns:repeat(2, minmax(0, 1fr));");
    expect(markup).toContain("--rmg-grid-gap:18px;");
    expect(markup).toContain('[data-rmg-grid-item-key="lead"]{grid-column:span 2 / span 2;}');
  });

  test("uses skeleton slot spans when explicit grid items are not provided", () => {
    const markup = renderToStaticMarkup(
      React.createElement(GridSkeletonCard, {
        count: 2,
        columns: 12,
        allowItemSpans: true,
        spec: {
          layout: {
            kind: "grid",
            item: {
              kind: "rect",
              style: {
                width: "100%",
                height: 120,
              },
            },
            slots: [
              {
                span: {
                  0: "full",
                  840: 6,
                },
              },
              {
                span: 6,
              },
            ],
          },
        },
      })
    );

    expect(markup).toContain('data-rmg-grid-item-key="slot-0"');
    expect(markup).toContain("grid-column:1 / -1");
    expect(markup).toContain('[data-rmg-grid-item-key="slot-0"]{grid-column:span 6 / span 6;}');
    expect(markup).toContain("grid-column:span 6 / span 6");
  });
});
