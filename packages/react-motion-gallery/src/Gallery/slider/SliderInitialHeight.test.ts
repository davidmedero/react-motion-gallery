import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import type { SliderSkeletonSpec } from "./SliderSkeleton";
import { Slider, buildScopedInitialHeightCss } from "./index";

const CARDS_SKELETON_SPEC: SliderSkeletonSpec = {
  mode: "fit",
  layout: {
    kind: "slider",
    direction: "row",
    style: {
      gap: 20,
      padding: "0 0 16px 0",
    },
    item: {
      kind: "col",
      style: {
        gap: 12,
        padding: "16px",
      },
      children: [
        {
          kind: "rect",
          style: {
            width: "100%",
            aspectRatio: "4 / 5",
            borderRadius: 16,
          },
        },
        {
          kind: "text",
          fontSize: 16,
          lineHeight: 1.2,
          style: {
            width: "76%",
          },
        },
        {
          kind: "text",
          fontSize: 14,
          lineHeight: 1.1,
          style: {
            width: "34%",
          },
        },
      ],
    },
    itemWrapStyle: {
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      boxShadow: "0 3px 6px rgba(15, 23, 42, 0.08)",
    },
    children: [
      {
        kind: "rect",
        style: {
          width: 120,
          height: 32,
          borderRadius: 999,
          alignSelf: "center",
          marginTop: "20px",
        },
      },
    ],
  },
};

const CARDS_COUNT = { xs: 1, md: 2, lg: 3 };
const RESPONSIVE_LOADING_COUNT = { 0: 2, 900: 4 };

const RESPONSIVE_SCOPE_SKELETON_SPEC: SliderSkeletonSpec = {
  mode: "peek",
  layout: {
    kind: "slider",
    direction: "row",
    style: {
      0: { gap: 12 },
      900: { gap: 24 },
    },
    item: {
      kind: "text",
      fontSize: 16,
      lineHeight: 1.25,
      lines: {
        0: 3,
        900: 2,
      },
      style: {
        width: "72%",
      },
    },
    itemWrapStyle: {
      width: 220,
      height: 160,
      borderRadius: 16,
    },
  },
};

const RESPONSIVE_CONTAINER_HEIGHT_SKELETON_SPEC: SliderSkeletonSpec = {
  mode: "fit",
  layout: {
    kind: "slider",
    direction: "row",
    item: {
      kind: "col",
      style: {
        0: {
          padding: "10px 0 0",
        },
        768: {
          padding: "20px 0 0",
        },
      },
      children: [
        {
          kind: "rect",
          style: {
            width: "100%",
            height: 100,
          },
        },
      ],
    },
    children: [
      {
        kind: "col",
        style: {
          0: {
            padding: "14px 0 0",
          },
          768: {
            padding: "20px 0 0",
          },
        },
        children: [
          {
            kind: "rect",
            style: {
              width: 162,
              height: 32,
              borderRadius: 999,
              alignSelf: "center",
            },
          },
        ],
      },
    ],
  },
};

const CUSTOM_BREAKPOINTS = {
  ...BREAKPOINT_MAP,
  tablet: 840,
};

const RESPONSIVE_BASE_STYLE_HEIGHT_SKELETON_SPEC: SliderSkeletonSpec = {
  mode: "fit",
  layout: {
    kind: "slider",
    direction: "row",
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
    children: [
      {
        kind: "rect",
        style: {
          xs: {
            width: 162,
            height: 32,
          },
          tablet: {
            width: 162,
            height: 48,
          },
        },
      },
    ],
  },
};

const CENTER_FIRST_SCOPE_SKELETON_SPEC: SliderSkeletonSpec = {
  mode: "peek",
  centering: "first",
  layout: {
    kind: "slider",
    direction: "row",
    style: {
      0: { gap: 16 },
      900: { gap: 24 },
    },
    item: {
      kind: "rect",
      style: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
      },
    },
    slots: [
      {
        itemWrapStyle: {
          width: 220,
          height: 140,
        },
      },
      {
        itemWrapStyle: {
          width: 240,
          height: 140,
        },
      },
      {
        itemWrapStyle: {
          width: 260,
          height: 140,
        },
      },
      {
        itemWrapStyle: {
          width: 280,
          height: 140,
        },
      },
    ],
  },
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractRuleBlock(css: string, selector: string) {
  const match = css.match(new RegExp(`${escapeRegExp(selector)}\\{([^}]*)\\}`));
  return match?.[1] ?? "";
}

function extractDeclaration(ruleBlock: string, prop: string) {
  const match = ruleBlock.match(
    new RegExp(`${escapeRegExp(prop)}:([^;]+);`)
  );
  return match?.[1].trim() ?? null;
}

describe("Slider initial height CSS", () => {
  test("scopes cards-like initial-height CSS with data-rmg-scope selectors", () => {
    const css = buildScopedInitialHeightCss({
      scopeId: "rmg-slider-test",
      skeletonSpec: CARDS_SKELETON_SPEC,
      responsiveCount: CARDS_COUNT,
      fallbackCount: 1,
      breakpointMap: BREAKPOINT_MAP,
    });

    const shellSelector =
      '[data-rmg-scope="rmg-slider-test"] > [data-rmg-scope-shell="true"]';

    expect(css).toContain(shellSelector);
    expect(css).not.toContain("#rmg-slider-test");
    expect(css).toContain("--rmg-slider-initial-height:");
    expect(css).toContain("--rmg-slider-row-height:");
    expect(css).toContain("--rmg-slider-extras-height:");
    expect(css.match(/--rmg-slider-initial-height:/g)?.length ?? 0).toBe(3);
    expect(css.match(/--rmg-slider-row-height:/g)?.length ?? 0).toBe(3);
    expect(css.match(/--rmg-slider-extras-height:/g)?.length ?? 0).toBe(3);
    expect(css).toContain("@media (min-width:900px)");
    expect(css).toContain("@media (min-width:1200px)");

    const baseRule = extractRuleBlock(css, shellSelector);
    expect(
      extractDeclaration(baseRule, "--rmg-slider-initial-height")
    ).not.toBe(extractDeclaration(baseRule, "--rmg-slider-row-height"));
    expect(
      extractDeclaration(baseRule, "--rmg-slider-extras-height")
    ).toBeTruthy();
  });

  test("renders scoped initial-height CSS alongside matching SSR slider scope markup", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Slider,
        {
          layout: {
            cellsPerSlide: CARDS_COUNT,
          },
          controls: {
            arrows: { enabled: false },
            dots: { enabled: false },
            progress: { enabled: false },
            scrollbar: { enabled: false },
          },
          transitions: {
            loading: {
              force: true,
              skeletonCount: CARDS_COUNT,
              skeleton: CARDS_SKELETON_SPEC,
            },
          },
        },
        React.createElement("div", { key: "card-1" }, "One"),
        React.createElement("div", { key: "card-2" }, "Two"),
        React.createElement("div", { key: "card-3" }, "Three")
      )
    );

    const scopeMatch = markup.match(/data-rmg-scope="([^"]+)"/);
    expect(scopeMatch?.[1]).toBeTruthy();

    const scopeId = scopeMatch![1];
    const shellSelector = `[data-rmg-scope="${scopeId}"] > [data-rmg-scope-shell="true"]`;

    expect(scopeId).toMatch(/^rmg-slider-/);
    expect(scopeId).not.toContain(":");
    expect(markup).toContain(`data-rmg-scope="${scopeId}"`);
    expect(markup).toContain(shellSelector);
    expect(markup).not.toContain(`#${scopeId}`);
    expect(markup).toContain("--rmg-slider-initial-height:");
    expect(markup).toContain("--rmg-slider-row-height:");
    expect(markup).toContain("--rmg-slider-extras-height:");
  });

  test("includes responsive text line breakpoints in scoped initial-height CSS", () => {
    const css = buildScopedInitialHeightCss({
      scopeId: "rmg-slider-responsive-text",
      skeletonSpec: {
        mode: "fit",
        layout: {
          kind: "slider",
          direction: "row",
          item: {
            kind: "text",
            fontSize: 16,
            lineHeight: 1.5,
            lines: {
              0: 3,
              767: 2,
              1200: 1,
            },
          },
        },
      } satisfies SliderSkeletonSpec,
      responsiveCount: 1,
      fallbackCount: 1,
      breakpointMap: BREAKPOINT_MAP,
    });

    expect(css).toContain("--rmg-slider-row-height:72px;");
    expect(css).toContain("@media (min-width:767px)");
    expect(css).toContain("--rmg-slider-row-height:48px;");
    expect(css).toContain("@media (min-width:1200px)");
    expect(css).toContain("--rmg-slider-row-height:24px;");
  });

  test("includes responsive container-style breakpoints in scoped initial-height CSS", () => {
    const scopeId = "rmg-slider-responsive-container";
    const css = buildScopedInitialHeightCss({
      scopeId,
      skeletonSpec: RESPONSIVE_CONTAINER_HEIGHT_SKELETON_SPEC,
      responsiveCount: 1,
      fallbackCount: 1,
      breakpointMap: BREAKPOINT_MAP,
    });

    const shellSelector =
      `[data-rmg-scope="${scopeId}"] > [data-rmg-scope-shell="true"]`;
    const baseRule = extractRuleBlock(css, shellSelector);

    expect(extractDeclaration(baseRule, "--rmg-slider-row-height")).toBe("calc(100px + 10px)");
    expect(extractDeclaration(baseRule, "--rmg-slider-extras-height")).toBe("calc(32px + 14px)");
    expect(extractDeclaration(baseRule, "--rmg-slider-initial-height")).toBe(
      "calc(calc(100px + 10px) + calc(32px + 14px))"
    );
    expect(css).toContain("@media (min-width:768px)");
    expect(css).toContain(
      `@media (min-width:768px){${shellSelector}{--rmg-slider-initial-height:calc(calc(100px + 20px) + calc(32px + 20px));--rmg-slider-row-height:calc(100px + 20px);--rmg-slider-extras-height:calc(32px + 20px);}}`
    );
  });

  test("includes responsive base-style breakpoints in scoped initial-height CSS", () => {
    const scopeId = "rmg-slider-responsive-base-style";
    const css = buildScopedInitialHeightCss({
      scopeId,
      skeletonSpec: RESPONSIVE_BASE_STYLE_HEIGHT_SKELETON_SPEC,
      responsiveCount: 1,
      fallbackCount: 1,
      breakpointMap: CUSTOM_BREAKPOINTS,
    });

    const shellSelector =
      `[data-rmg-scope="${scopeId}"] > [data-rmg-scope-shell="true"]`;
    const baseRule = extractRuleBlock(css, shellSelector);

    expect(extractDeclaration(baseRule, "--rmg-slider-row-height")).toBe("100px");
    expect(extractDeclaration(baseRule, "--rmg-slider-extras-height")).toBe("32px");
    expect(extractDeclaration(baseRule, "--rmg-slider-initial-height")).toBe(
      "calc(100px + 32px)"
    );
    expect(css).toContain("@media (min-width:840px)");
    expect(css).toContain(
      `@media (min-width:840px){${shellSelector}{--rmg-slider-initial-height:calc(160px + 48px);--rmg-slider-row-height:160px;--rmg-slider-extras-height:48px;}}`
    );
  });

  test("preserves explicit viewport height while still reserving skeleton extras", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Slider,
        {
          elements: {
            viewport: {
              style: {
                height: 320,
              },
            },
          },
          layout: {
            cellsPerSlide: CARDS_COUNT,
          },
          controls: {
            arrows: { enabled: false },
            dots: { enabled: false },
            progress: { enabled: false },
            scrollbar: { enabled: false },
          },
          transitions: {
            loading: {
              force: true,
              skeletonCount: CARDS_COUNT,
              skeleton: CARDS_SKELETON_SPEC,
            },
          },
        },
        React.createElement("div", { key: "card-1" }, "One"),
        React.createElement("div", { key: "card-2" }, "Two"),
        React.createElement("div", { key: "card-3" }, "Three")
      )
    );

    expect(markup).toContain("--rmg-slider-initial-height:320px;");
    expect(markup).toContain("--rmg-slider-row-height:320px;");
    expect(markup).toContain("--rmg-slider-extras-height:");
  });

  test("roots built-in responsive skeleton CSS in the outer slider loading scope", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Slider,
        {
          controls: {
            arrows: { enabled: false },
            dots: { enabled: false },
            progress: { enabled: false },
            scrollbar: { enabled: false },
          },
          transitions: {
            loading: {
              force: true,
              skeletonCount: RESPONSIVE_LOADING_COUNT,
              skeleton: RESPONSIVE_SCOPE_SKELETON_SPEC,
            },
          },
        },
        React.createElement("div", { key: "slide-1" }, "One"),
        React.createElement("div", { key: "slide-2" }, "Two"),
        React.createElement("div", { key: "slide-3" }, "Three"),
        React.createElement("div", { key: "slide-4" }, "Four")
      )
    );

    const scopeMatch = markup.match(/data-rmg-scope="([^"]+)"/);
    expect(scopeMatch?.[1]).toBeTruthy();

    const scopeId = scopeMatch![1];
    const builtInScopeSelector =
      `[data-rmg-scope="${scopeId}"] > [data-rmg-scope-shell="true"] [data-rmg-skel-part="overlay"]`;

    expect(markup).not.toContain("data-rmg-slider-skel-scope=");
    expect(markup).toContain(`${builtInScopeSelector} [data-rmg-skel-node="n1"]`);
    expect(markup).toContain(`@media (min-width:900px){${builtInScopeSelector} [data-rmg-skel-node="n1"]`);
  });

  test("keeps responsive slot visibility rooted in the outer slider scope at 900px+", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Slider,
        {
          controls: {
            arrows: { enabled: false },
            dots: { enabled: false },
            progress: { enabled: false },
            scrollbar: { enabled: false },
          },
          transitions: {
            loading: {
              force: true,
              skeletonCount: RESPONSIVE_LOADING_COUNT,
              skeleton: RESPONSIVE_SCOPE_SKELETON_SPEC,
            },
          },
        },
        React.createElement("div", { key: "slide-1" }, "One"),
        React.createElement("div", { key: "slide-2" }, "Two"),
        React.createElement("div", { key: "slide-3" }, "Three"),
        React.createElement("div", { key: "slide-4" }, "Four")
      )
    );

    const scopeMatch = markup.match(/data-rmg-scope="([^"]+)"/);
    expect(scopeMatch?.[1]).toBeTruthy();

    const scopeId = scopeMatch![1];
    expect(markup).toContain(`[data-rmg-scope="${scopeId}"] [data-rmg-skel-slot="4"]{ display:block; }`);
  });

  test("preserves centered peek spacer behavior after moving responsive skeleton CSS to the outer scope", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Slider,
        {
          align: "center",
          controls: {
            arrows: { enabled: false },
            dots: { enabled: false },
            progress: { enabled: false },
            scrollbar: { enabled: false },
          },
          transitions: {
            loading: {
              force: true,
              skeletonCount: RESPONSIVE_LOADING_COUNT,
              skeleton: CENTER_FIRST_SCOPE_SKELETON_SPEC,
            },
          },
        },
        React.createElement("div", { key: "slide-1" }, "One"),
        React.createElement("div", { key: "slide-2" }, "Two"),
        React.createElement("div", { key: "slide-3" }, "Three"),
        React.createElement("div", { key: "slide-4" }, "Four")
      )
    );

    const scopeMatch = markup.match(/data-rmg-scope="([^"]+)"/);
    expect(scopeMatch?.[1]).toBeTruthy();

    const scopeId = scopeMatch![1];
    const builtInScopeSelector =
      `[data-rmg-scope="${scopeId}"] > [data-rmg-scope-shell="true"] [data-rmg-skel-part="overlay"]`;

    expect(markup).not.toContain("data-rmg-slider-skel-scope=");
    expect(markup).toContain('data-rmg-skel-center-first-spacer="true"');
    expect(markup).toContain("--rmg-slider-center-first-spacer-width:");
    expect(markup).toContain(`${builtInScopeSelector} [data-rmg-skel-node="n1"]`);
  });

  test("keeps only the outer data-rmg-scope while the inner slider core still renders scoped base CSS", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Slider,
        {
          controls: {
            arrows: { enabled: false },
            dots: { enabled: false },
            progress: { enabled: false },
            scrollbar: { enabled: false },
          },
          transitions: {
            loading: {
              enabled: false,
            },
          },
        },
        React.createElement("div", { key: "slide-1" }, "One"),
        React.createElement("div", { key: "slide-2" }, "Two")
      )
    );

    const outerScopeMatches = markup.match(/data-rmg-scope="/g) ?? [];
    expect(outerScopeMatches).toHaveLength(1);

    const innerScopeMatch = markup.match(/data-rmg-slider-core-scope="([^"]+)"/);
    expect(innerScopeMatch).toBeTruthy();

    const innerScope = innerScopeMatch?.[1];
    expect(innerScope).toBeTruthy();
    expect(markup).toContain(`[data-rmg-slider-core-scope="${innerScope}"]`);
  });
});
