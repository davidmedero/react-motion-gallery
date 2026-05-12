import { describe, expect, test } from "vitest";
import { deriveBarWidthValue, discoverWrapBreakpoints } from "./discovery";
import type { WrapMeasureEngine } from "./types";

type FakePrepared = {
  text: string;
};

const fakeEngine: WrapMeasureEngine<FakePrepared> = {
  prepare: ({ text }) => ({ text }),
  measureLineCount: ({ width }) => {
    if (width < 400) return { lineCount: 3, maxLineWidth: width };
    if (width < 700) return { lineCount: 2, maxLineWidth: width * 0.83 };
    return { lineCount: 1, maxLineWidth: width * 0.84 };
  },
  layoutLines: ({ width }) => {
    if (width < 400) {
      return [1, 0.92, 0.58].map((ratio, index) => ({
        text: `line-${index + 1}`,
        width: width * ratio,
      }));
    }

    if (width < 700) {
      return [0.83, 0.3].map((ratio, index) => ({
        text: `line-${index + 1}`,
        width: width * ratio,
      }));
    }

    return [{ text: "line-1", width: width * 0.84 }];
  },
};

describe("discoverWrapBreakpoints", () => {
  test("records minimal wrap transitions and diagnostic segments", () => {
    const prepared = fakeEngine.prepare({
      text: "Example body copy",
      font: "400 16px Arial",
    });

    const result = discoverWrapBreakpoints({
      prepared,
      lineHeight: 1.6,
      viewportMin: 320,
      viewportMax: 900,
      widthAtViewport: (viewportWidth) => viewportWidth,
      includeBarWidths: true,
      measureEngine: fakeEngine,
    });

    expect(result.lines).toEqual({
      0: 3,
      400: 2,
      700: 1,
    });
    expect(result.barWidth).toEqual({
      0: ["100%", "92%", "58%"],
      400: ["83%", "30%"],
      700: "84%",
    });
    expect(result.segments).toEqual([
      {
        fromViewport: 320,
        toViewport: 399,
        fromWidthPx: 320,
        toWidthPx: 399,
        lineCount: 3,
      },
      {
        fromViewport: 400,
        toViewport: 699,
        fromWidthPx: 400,
        toWidthPx: 699,
        lineCount: 2,
      },
      {
        fromViewport: 700,
        toViewport: 900,
        fromWidthPx: 700,
        toWidthPx: 900,
        lineCount: 1,
      },
    ]);
  });

  test("rounds and clamps derived bar widths into authoring-friendly percentages", () => {
    expect(
      deriveBarWidthValue({
        lineWidths: [199.5, 1.4],
        containerWidth: 200,
      })
    ).toEqual(["100%", "1%"]);
  });
});
