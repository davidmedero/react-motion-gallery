import { describe, expect, test } from "vitest";

import { BREAKPOINT_MAP } from "../responsive";
import {
  buildResponsiveBaseStyleCssRules,
  buildResponsiveContainerStyleCssRules,
  containerStylesPlain,
  collectResponsiveStyleBreakpoints,
  nodeStyleVars,
  resolveInlineResponsiveContainerStyle,
  resolveResponsiveBaseStyleAtMinWidth,
  resolveResponsiveContainerStyleAtMinWidth,
} from "./layout";

describe("skeleton responsive style helpers", () => {
  test("resolves caller-provided breakpoint aliases for responsive styles", () => {
    const breakpoints = {
      ...BREAKPOINT_MAP,
      tablet: 840,
    };
    const out = new Set<number>();

    expect(
      resolveResponsiveBaseStyleAtMinWidth(
        {
          tablet: {
            height: 160,
          },
        },
        840,
        breakpoints
      )
    ).toEqual({
      height: 160,
    });

    collectResponsiveStyleBreakpoints(
      {
        tablet: { width: "72%" },
      },
      out,
      breakpoints
    );

    expect(Array.from(out)).toEqual([840]);
  });

  test("resolves named and numeric breakpoint maps for base styles", () => {
    const style = {
      xs: {
        width: "100%",
      },
      md: {
        width: "72%",
      },
      1200: {
        height: 320,
      },
    };

    expect(
      resolveResponsiveBaseStyleAtMinWidth(style, 0, BREAKPOINT_MAP)
    ).toEqual({
      width: "100%",
    });

    expect(
      resolveResponsiveBaseStyleAtMinWidth(style, 900, BREAKPOINT_MAP)
    ).toEqual({
      width: "72%",
    });

    expect(
      resolveResponsiveBaseStyleAtMinWidth(style, 1280, BREAKPOINT_MAP)
    ).toEqual({
      width: "72%",
      height: 320,
    });
  });

  test("merges mixed breakpoint aliases that resolve to the same min-width with later entries winning", () => {
    const breakpoints = {
      ...BREAKPOINT_MAP,
      tablet: BREAKPOINT_MAP.md,
    };
    const style = {
      md: {
        width: "72%",
        maxWidth: 420,
      },
      tablet: {
        width: "68%",
      },
    };

    expect(
      resolveResponsiveBaseStyleAtMinWidth(style, 900, breakpoints)
    ).toEqual({
      width: "68%",
      maxWidth: 420,
    });
  });

  test("collects responsive breakpoints for base and container styles using named aliases", () => {
    const out = new Set<number>();

    collectResponsiveStyleBreakpoints(
      {
        xs: { width: "100%" },
        lg: { width: "80%" },
        1600: { width: "72%" },
      },
      out,
      BREAKPOINT_MAP
    );

    collectResponsiveStyleBreakpoints(
      {
        md: { gap: 16 },
        1400: { gap: 24 },
      },
      out,
      BREAKPOINT_MAP
    );

    expect(Array.from(out).sort((a, b) => a - b)).toEqual([
      900,
      1200,
      1400,
      1600,
    ]);
  });

  test("resolves responsive container styles with named breakpoints", () => {
    const style = {
      xs: { gap: 12, padding: 8 },
      md: { gap: 20 },
      xl: { padding: 24 },
    };

    expect(
      resolveResponsiveContainerStyleAtMinWidth(style, 0, BREAKPOINT_MAP)
    ).toEqual({
      gap: 12,
      padding: 8,
    });

    expect(
      resolveResponsiveContainerStyleAtMinWidth(style, 900, BREAKPOINT_MAP)
    ).toEqual({
      gap: 20,
      padding: 8,
    });

    expect(
      resolveResponsiveContainerStyleAtMinWidth(style, 1600, BREAKPOINT_MAP)
    ).toEqual({
      gap: 20,
      padding: 24,
    });
  });

  test("keeps responsive container properties out of inline styles and emits a base CSS rule", () => {
    const style = {
      0: {
        width: "100%",
        padding: "14px 0 0",
      },
      768: {
        width: "100%",
        padding: "20px 0 0",
      },
    };

    expect(resolveInlineResponsiveContainerStyle(style, BREAKPOINT_MAP)).toBeUndefined();

    expect(
      buildResponsiveContainerStyleCssRules({
        style,
        breakpointMap: BREAKPOINT_MAP,
      })
    ).toEqual([
      {
        minWidth: 0,
        css: "__NODE_SEL__{padding:14px 0 0;width:100%;}",
        raw: true,
      },
      {
        minWidth: 768,
        css: "__NODE_SEL__{padding:20px 0 0;width:100%;}",
        raw: true,
      },
    ]);
  });

  test("serializes explicit skeleton node heights before width and paint styles", () => {
    expect(
      Object.keys(
        nodeStyleVars(
          {
            width: 56,
            minWidth: 24,
            height: 40,
            minHeight: 32,
            maxHeight: 64,
            borderRadius: 12,
          },
          undefined
        )
      ).slice(0, 6)
    ).toEqual([
      "height",
      "minHeight",
      "maxHeight",
      "inlineSize",
      "width",
      "minInlineSize",
    ]);

    expect(
      buildResponsiveBaseStyleCssRules({
        style: {
          0: {
            width: 56,
            height: 40,
            borderRadius: 12,
          },
        },
      })[0]?.css
    ).toBe("__NODE_SEL__{height:40px;inline-size:56px;width:56px;--rmg-skel-radius:12px;}");
  });

  test("serializes typed flex container and item style props", () => {
    const plain = containerStylesPlain({
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: 12,
      columnGap: 18,
      alignItems: "stretch",
      alignContent: "space-between",
      justifyContent: "center",
      flex: "1 1 320px",
      flexBasis: 320,
      flexGrow: 2,
      minWidth: 180,
      minHeight: 120,
      boxSizing: "border-box",
      backgroundColor: "#fff",
      borderRadius: 18,
      margin: 8,
    });

    expect(plain).toMatchObject({
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: "12px",
      columnGap: "18px",
      alignItems: "stretch",
      alignContent: "space-between",
      justifyContent: "center",
      flex: "1 1 320px",
      flexBasis: "320px",
      flexGrow: 2,
      minWidth: "180px",
      minHeight: "120px",
      boxSizing: "border-box",
      backgroundColor: "#fff",
      borderRadius: "18px",
      margin: "8px",
    });
  });

  test("builds responsive CSS for typed flex container and item props", () => {
    const rules = buildResponsiveContainerStyleCssRules({
      style: {
        0: {
          flexDirection: "column",
          flex: "1 1 220px",
          minWidth: 0,
          rowGap: 12,
        },
        md: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          columnGap: 18,
          flexBasis: "320px",
        },
      },
    });

    expect(rules).toHaveLength(2);
    expect(rules[0]?.css).toContain("flex-direction:column;");
    expect(rules[0]?.css).toContain("flex:1 1 220px;");
    expect(rules[0]?.css).toContain("min-width:0px;");
    expect(rules[0]?.css).toContain("row-gap:12px;");
    expect(rules[1]?.minWidth).toBe(BREAKPOINT_MAP.md);
    expect(rules[1]?.css).toContain("flex-direction:row;");
    expect(rules[1]?.css).toContain("flex-wrap:wrap;");
    expect(rules[1]?.css).toContain("justify-content:space-between;");
    expect(rules[1]?.css).toContain("column-gap:18px;");
    expect(rules[1]?.css).toContain("flex-basis:320px;");
  });
});
