import { describe, expect, test } from "vitest";

import {
  buildResponsiveTextCssRules,
  collectResponsiveTextBreakpoints,
  getResponsiveTextRenderState,
  getSafariTextSkeletonMetrics,
  getTextSkeletonMetrics,
} from "./text";

describe("skeleton text layout helpers", () => {
  test("keeps manual line-count mode unchanged", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: {
        0: 16,
        900: 20,
      },
      lineHeight: 1.5,
      lines: {
        0: 2,
        900: 1,
      },
      lastBarWidth: {
        0: "68%",
        900: "56%",
      },
    });

    expect(renderState.baseState.lineCount).toBe(2);
    expect(renderState.baseState.barWidths).toEqual(["100%", "68%"]);
    expect(renderState.baseState.metrics.barHeight).toBe(16);
    expect(renderState.maxLines).toBe(2);
    expect(renderState.usesResponsiveBarCss).toBe(true);
    expect(renderState.states[1]?.state.barWidths).toEqual(["56%"]);
    expect(renderState.states[1]?.state.metrics.barHeight).toBe(20);
  });

  test("builds responsive CSS for manual line-count changes", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: {
        0: 16,
        900: 20,
      },
      lineHeight: 1.5,
      lines: {
        0: 3,
        900: 2,
      },
      lastBarWidth: {
        0: "64%",
        900: "52%",
      },
    });

    const cssRules = buildResponsiveTextCssRules({
      renderState,
    });

    expect(cssRules).toHaveLength(2);
    expect(cssRules[0]?.css).toContain('display:none !important;');
    expect(cssRules[0]?.css).toContain("height:16px !important;");
    expect(cssRules[0]?.css).toContain("nth-child(-n+3)");
    expect(cssRules[1]?.css).toContain("nth-child(-n+2)");
    expect(cssRules[1]?.css).toContain("nth-child(n+3){display:none !important;}");
    expect(cssRules[1]?.css).toContain("height:20px !important;");
    expect(cssRules[1]?.css).toContain("nth-child(2){max-width:52% !important;}");
  });

  test("marks container-responsive text rules for container queries", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: 16,
      lineHeight: 1.5,
      responsiveBy: "container",
      lines: {
        0: 2,
        221.656: 1,
      },
      barWidth: {
        0: ["176px", "41px"],
        221.656: "222px",
      },
    });

    const cssRules = buildResponsiveTextCssRules({
      renderState,
    });

    expect(renderState.responsiveBy).toBe("container");
    expect(cssRules[1]?.query).toBe("container");
    expect(cssRules[1]?.minWidth).toBe(221.656);
    expect(cssRules[1]?.css).toContain("nth-child(-n+1)");
  });

  test("builds responsive CSS for lineHeight changes", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: 16,
      lineHeight: {
        0: 1.25,
        900: 1.5,
      },
      lines: 2,
      lastBarWidth: "60%",
    });

    const cssRules = buildResponsiveTextCssRules({
      renderState,
    });

    expect(renderState.baseState.metrics.totalHeight).toBe(40);
    expect(renderState.states[1]?.state.metrics.totalHeight).toBe(48);
    expect(cssRules[0]?.css).toContain("height:40px !important;");
    expect(cssRules[0]?.css).toContain("padding-block:2px !important;");
    expect(cssRules[0]?.css).toContain("row-gap:4px !important;");
    expect(cssRules[1]?.css).toContain("height:48px !important;");
    expect(cssRules[1]?.css).toContain("padding-block:4px !important;");
    expect(cssRules[1]?.css).toContain("row-gap:8px !important;");
  });

  test("quantizes fractional line boxes to browser text layout units", () => {
    const metrics = getTextSkeletonMetrics({
      barHeight: 13,
      lineHeight: 1.62,
      lines: 2,
    });

    expect(metrics.lineBoxHeight).toBe(21.046875);
    expect(metrics.totalHeight).toBe(42.09375);
    expect(metrics.paddingBlock).toBe(4.0234375);
    expect(metrics.rowGap).toBe(8.046875);
  });

  test("floors Safari line boxes to match WebKit text block layout", () => {
    const metrics = getSafariTextSkeletonMetrics({
      barHeight: 18,
      lineHeight: 1.2,
      lines: 2,
    });

    expect(metrics.lineBoxHeight).toBe(21);
    expect(metrics.totalHeight).toBe(42);
    expect(metrics.paddingBlock).toBe(1.5);
    expect(metrics.rowGap).toBe(3);
  });

  test("applies scalar barWidth to every visible line", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: 16,
      barWidth: "80%",
      lineHeight: 1.5,
      lines: 3,
      lastBarWidth: "40%",
    });

    expect(renderState.baseState.barWidths).toEqual(["80%", "80%", "80%"]);
  });

  test("applies array barWidth values per line and converts numbers to px", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: 16,
      barWidth: ["100%", 92, "68%"],
      lineHeight: 1.5,
      lines: 3,
    });

    expect(renderState.baseState.barWidths).toEqual(["100%", "92px", "68%"]);
  });

  test("fills short barWidth arrays with 100% for missing lines", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: 16,
      barWidth: ["88%"],
      lineHeight: 1.5,
      lines: 3,
    });

    expect(renderState.baseState.barWidths).toEqual(["88%", "100%", "100%"]);
  });

  test("truncates long barWidth arrays to the visible line count", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: 16,
      barWidth: ["100%", "92%", "68%", "44%"],
      lineHeight: 1.5,
      lines: 2,
    });

    expect(renderState.baseState.barWidths).toEqual(["100%", "92%"]);
  });

  test("includes responsive barWidth breakpoints and ignores lastBarWidth when barWidth is present", () => {
    expect(
      collectResponsiveTextBreakpoints({
        barHeight: 16,
        barWidth: {
          md: ["100%", "95%", "80%", "60%"],
        },
        lineHeight: 1.5,
        lastBarWidth: {
          lg: "42%",
        },
      })
    ).toEqual([0, 900]);
  });

  test("lets barWidth override lastBarWidth", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: 16,
      barWidth: ["100%", "92%", "80%"],
      lineHeight: 1.5,
      lines: 3,
      lastBarWidth: "24%",
    });

    expect(renderState.baseState.barWidths).toEqual(["100%", "92%", "80%"]);
  });

  test("dedupes responsive states when barWidth resolves to the same output", () => {
    const renderState = getResponsiveTextRenderState({
      barHeight: 16,
      barWidth: {
        0: ["100%", "92%", "68%"],
        md: ["100%", "92%", "68%"],
      },
      lineHeight: 1.5,
      lines: 3,
    });

    expect(renderState.states).toHaveLength(1);
    expect(renderState.usesResponsiveBarCss).toBe(false);
    expect(renderState.baseState.barWidths).toEqual(["100%", "92%", "68%"]);
  });
});
