import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import {
  buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr,
  buildInitialHeightFromSkeletonSpecCssExpr,
  buildRowHeightFromSkeletonSpecCssExpr,
  collectResponsiveSliderCompensationBreakpoints,
  SliderSkeletonCard,
  type SliderSkeletonNode,
} from "./SliderSkeleton";

const CUSTOM_BREAKPOINTS = {
  ...BREAKPOINT_MAP,
  tablet: 840,
};

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
      'data-rmg-skel-text-line="true"]{display:none !important;height:16px !important;}'
    );
    expect(markup).toContain("@media (min-width:1200px)");
    expect(markup).toContain("nth-child(1){max-width:56% !important;}");
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
