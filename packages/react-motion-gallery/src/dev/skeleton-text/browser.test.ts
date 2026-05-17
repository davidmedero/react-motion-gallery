import { describe, expect, test } from "vitest";
import {
  DEFAULT_LINE_WRAP_GUARD_PX,
  buildViewportRanges,
  buildBrowserResponsiveNumberResult,
  buildBrowserResponsiveResult,
  groupClientRectsIntoLineWidths,
  toBrowserBarWidthValue,
} from "./browser";

describe("browser skeleton text helpers", () => {
  test("defaults to exact DOM line measurement", () => {
    expect(DEFAULT_LINE_WRAP_GUARD_PX).toBe(0);
  });

  test("groups client rects into merged line widths", () => {
    expect(
      groupClientRectsIntoLineWidths([
        { top: 10, left: 0, right: 40, width: 40, height: 12 },
        { top: 10.4, left: 40, right: 100, width: 60, height: 12 },
        { top: 28, left: 0, right: 58, width: 58, height: 12 },
      ])
    ).toEqual([100, 58]);
  });

  test("can emit pixel bar widths for browser-measured caps", () => {
    expect(
      toBrowserBarWidthValue({
        lineWidthsPx: [183.6, 91.2],
        containerWidthPx: 220,
        unit: "px",
      })
    ).toEqual(["184px", "91px"]);
  });

  test("splits viewport ranges across balanced workers", () => {
    expect(
      buildViewportRanges({
        viewportMin: 320,
        viewportMax: 329,
        workerCount: 4,
      })
    ).toEqual([
      { from: 320, to: 322 },
      { from: 323, to: 325 },
      { from: 326, to: 327 },
      { from: 328, to: 329 },
    ]);

    expect(
      buildViewportRanges({
        viewportMin: 320,
        viewportMax: 322,
        workerCount: 8,
      })
    ).toEqual([
      { from: 320, to: 320 },
      { from: 321, to: 321 },
      { from: 322, to: 322 },
    ]);
  });

  test("captures exact bar widths at container line-count transition breakpoints", () => {
    const result = buildBrowserResponsiveResult({
      exportName: "leadBody",
      widthMode: "both",
      samples: [
        {
          viewportWidth: 0,
          containerWidthPx: 200,
          lineCount: 2,
          lineWidthsPx: [200, 120],
          barWidth: ["100%", "60%"],
        },
        {
          viewportWidth: 1,
          containerWidthPx: 201,
          lineCount: 2,
          lineWidthsPx: [201, 121],
          barWidth: ["100%", "60%"],
        },
        {
          viewportWidth: 20,
          containerWidthPx: 220,
          lineCount: 2,
          lineWidthsPx: [220, 99],
          barWidth: ["100%", "45%"],
        },
        {
          viewportWidth: 30,
          containerWidthPx: 230,
          lineCount: 3,
          lineWidthsPx: [230, 189, 78],
          barWidth: ["100%", "82%", "34%"],
        },
      ],
    });

    expect(result.value.responsiveBy).toBe("container");
    expect(result.value.lines).toEqual({
      0: 2,
      230: 3,
    });
    expect(result.value.barWidth).toEqual({
      0: ["100%", "60%"],
      230: ["100%", "82%", "34%"],
    });
    expect(result.value.lastBarWidth).toEqual({
      0: "60%",
      230: "34%",
    });
    expect(result.value.segments).toEqual([
      {
        fromViewport: 200,
        toViewport: 220,
        fromWidthPx: 200,
        toWidthPx: 220,
        lineCount: 2,
      },
      {
        fromViewport: 230,
        toViewport: 230,
        fromWidthPx: 230,
        toWidthPx: 230,
        lineCount: 3,
      },
    ]);
  });

  test("can opt into bar-width breakpoints even when line count stays the same", () => {
    const result = buildBrowserResponsiveResult({
      exportName: "leadBody",
      widthMode: "both",
      breakpointStrategy: "lineOrBarChanges",
      samples: [
        {
          viewportWidth: 0,
          containerWidthPx: 200,
          lineCount: 2,
          lineWidthsPx: [200, 120],
          barWidth: ["100%", "60%"],
        },
        {
          viewportWidth: 1,
          containerWidthPx: 201,
          lineCount: 2,
          lineWidthsPx: [201, 121],
          barWidth: ["100%", "60%"],
        },
        {
          viewportWidth: 20,
          containerWidthPx: 220,
          lineCount: 2,
          lineWidthsPx: [220, 99],
          barWidth: ["100%", "45%"],
        },
        {
          viewportWidth: 30,
          containerWidthPx: 230,
          lineCount: 3,
          lineWidthsPx: [230, 189, 78],
          barWidth: ["100%", "82%", "34%"],
        },
      ],
    });

    expect(result.value.lines).toEqual({
      0: 2,
      220: 2,
      230: 3,
    });
    expect(result.value.barWidth).toEqual({
      0: ["100%", "60%"],
      220: ["100%", "45%"],
      230: ["100%", "82%", "34%"],
    });
    expect(result.value.lastBarWidth).toEqual({
      0: "60%",
      220: "45%",
      230: "34%",
    });
  });

  test("keys generated text states by measured container width", () => {
    const result = buildBrowserResponsiveResult({
      exportName: "cardTitle",
      textId: "card-title",
      samples: [
        {
          viewportWidth: 1067,
          containerWidthPx: 221.656,
          lineCount: 1,
          lineWidthsPx: [221.67],
          barWidth: "222px",
        },
        {
          viewportWidth: 1062,
          containerWidthPx: 220,
          lineCount: 2,
          lineWidthsPx: [176, 41],
          barWidth: ["176px", "41px"],
        },
      ],
    });

    expect(result.value.responsiveBy).toBe("container");
    expect(result.textId).toBe("card-title");
    expect(result.value.lines).toEqual({
      0: 2,
      221.656: 1,
    });
    expect(result.value.barWidth).toEqual({
      0: ["176px", "41px"],
      221.656: "222px",
    });
  });

  test("can emit measured skeleton text metrics alongside line maps", () => {
    const result = buildBrowserResponsiveResult({
      exportName: "cardTitle",
      includeTextMetrics: true,
      samples: [
        {
          viewportWidth: 320,
          containerWidthPx: 220,
          lineCount: 2,
          lineWidthsPx: [170, 40],
          barWidth: ["170px", "40px"],
          barHeight: 16,
          lineHeight: 1.2,
        },
        {
          viewportWidth: 640,
          containerWidthPx: 420,
          lineCount: 2,
          lineWidthsPx: [210, 100],
          barWidth: ["210px", "100px"],
          barHeight: 18,
          lineHeight: 1.333333,
        },
      ],
    });

    expect(result.value.lines).toBe(2);
    expect(result.value.barHeight).toEqual({
      0: 16,
      420: 18,
    });
    expect(result.value.lineHeight).toEqual({
      0: 1.2,
      420: 1.333,
    });
  });

  test("builds a minimal responsive numeric map for slider compensation", () => {
    expect(
      buildBrowserResponsiveNumberResult({
        exportName: "sliderCardsRowHeightCompensation",
        samples: [
          { viewportWidth: 320, value: 0 },
          { viewportWidth: 321, value: 0 },
          { viewportWidth: 500, value: 20.8 },
          { viewportWidth: 501, value: 20.8 },
          { viewportWidth: 768, value: 41.6 },
        ],
      })
    ).toEqual({
      kind: "responsiveNumber",
      exportName: "sliderCardsRowHeightCompensation",
      value: {
        0: 0,
        500: 20.8,
        768: 41.6,
      },
    });
  });
});
