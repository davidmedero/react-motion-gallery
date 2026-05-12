import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { BREAKPOINT_MAP } from "../../shared/responsive";
import { EntrySkeletonCard } from "./EntrySkeleton";

const CUSTOM_BREAKPOINTS = {
  ...BREAKPOINT_MAP,
  tablet: 840,
};

describe("EntrySkeleton text nodes", () => {
  test("renders wrapped text as multiple line bars with a shortened last line", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntrySkeletonCard, {
        spec: {
          layout: {
            kind: "stack",
            children: [
              {
                kind: "text",
                barHeight: 16,
                lineHeight: 1.5,
                lines: 2,
                style: {
                  width: "88%",
                },
              },
            ],
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
      React.createElement(EntrySkeletonCard, {
        spec: {
          layout: {
            kind: "stack",
            children: [
              {
                kind: "text",
                barHeight: 14,
                lineHeight: 1.5,
                style: {
                  width: "50%",
                },
              },
            ],
          },
        },
      })
    );

    expect(markup.match(/data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(1);
  });

  test("renders responsive text line CSS and a custom trailing line width", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntrySkeletonCard, {
        spec: {
          layout: {
            kind: "stack",
            children: [
              {
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
            ],
          },
        },
      })
    );

    expect(markup.match(/<div data-rmg-skel-text-line="true"/g) ?? []).toHaveLength(3);
    expect(markup).toContain("@media (min-width:767px)");
    expect(markup).toContain(
      'data-rmg-skel-text-line="true"]{display:none !important;height:16px !important;}'
    );
    expect(markup).toContain("@media (min-width:1200px)");
    expect(markup).toContain("nth-child(1){max-width:56% !important;}");
  });

  test("renders container-query text CSS when responsiveBy is container", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntrySkeletonCard, {
        spec: {
          layout: {
            kind: "stack",
            children: [
              {
                kind: "text",
                barHeight: 16,
                lineHeight: 1.5,
                responsiveBy: "container",
                lines: {
                  0: 3,
                  360: 2,
                },
                barWidth: {
                  0: ["180px", "160px", "90px"],
                  360: ["320px", "120px"],
                },
                style: {
                  width: "100%",
                },
              },
            ],
          },
        },
      })
    );

    expect(markup).toContain('data-rmg-skel-text-container="true"');
    expect(markup).toContain("container-type:inline-size");
    expect(markup).toContain("@container (min-width:360px)");
    expect(markup).toContain("nth-child(n+3){display:none !important;}");
  });

  test("emits responsive CSS for shape, text style, and media tile styles with custom aliases", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntrySkeletonCard, {
        breakpoints: CUSTOM_BREAKPOINTS,
        spec: {
          layout: {
            kind: "stack",
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

  test("serializes shared shimmer vars for entry defaults, including blur and disable", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntrySkeletonCard, {
        spec: {
          defaults: {
            shimmer: {
              enabled: false,
              blurPx: 4,
              timing: "ease-in-out",
              opacity: 0.55,
              c1: "rgba(255,255,255,0.1)",
              c2: "rgba(255,255,255,0.3)",
              c3: "rgba(255,255,255,0.1)",
            },
          },
        },
      })
    );

    expect(markup).toContain("--rmg-skel-shimmer-enabled:0");
    expect(markup).toContain("--rmg-skel-shimmer-blur:4px");
    expect(markup).toContain("--rmg-skel-shimmer-filter:blur(4px)");
    expect(markup).toContain("--rmg-skel-shimmer-timing:ease-in-out");
  });
});
