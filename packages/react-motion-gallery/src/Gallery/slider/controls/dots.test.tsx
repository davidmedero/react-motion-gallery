import * as React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { DefaultDotsFactory } from "./dots";

function readSliderCss() {
  return readFileSync(new URL("../Slider.module.css", import.meta.url), "utf8");
}

describe("slider dots defaults", () => {
  test("keeps default placement in CSS instead of inline container styles", () => {
    const DefaultDots = DefaultDotsFactory({
      AX: { main: "x", clientKey: "clientWidth" },
      createRipple: vi.fn(),
      styles: {
        dotsRoot: "dotsRoot",
        dotsRootX: "dotsRootX",
        dotsRootY: "dotsRootY",
        pagination_dot: "pagination_dot",
        active: "active",
        inactive: "inactive",
      },
      dotsContainerStyles: undefined,
      dotsStyles: undefined,
    });

    const markup = renderToStaticMarkup(
      <DefaultDots
        ref={{ current: null }}
        count={2}
        activeIndex={0}
        hidden={false}
        goTo={() => undefined}
        getDotRef={() => () => undefined}
        createRipple={() => undefined}
        classNameContainer="demo-dots"
        classNameDot="demo-dot"
      />
    );

    expect(markup).toContain('data-rmg-part="dots"');
    expect(markup).toContain('data-rmg-axis="x"');
    expect(markup).toContain('class="dotsRoot dotsRootX rmgDots demo-dots"');
    expect(markup).toContain("opacity:1");
    expect(markup).not.toContain("bottom:10px");
    expect(markup).not.toContain("left:50%");
    expect(markup).not.toContain("transform:translateX(-50%)");
    expect(markup).not.toContain("padding:4px 8px");
  });

  test("defines zero-specificity CSS defaults for both slider axes", () => {
    const css = readSliderCss();

    expect(css).toMatch(
      /:where\(\.dotsRoot\)\s*\{[^}]*position:\s*absolute;[^}]*z-index:\s*10;[^}]*border-radius:\s*9999px;/s
    );

    expect(css).toMatch(
      /:where\(\.dotsRootX\)\s*\{[^}]*left:\s*50%;[^}]*bottom:\s*10px;[^}]*transform:\s*translateX\(-50%\);/s
    );

    expect(css).toMatch(
      /:where\(\.dotsRootY\)\s*\{[^}]*top:\s*50%;[^}]*left:\s*10px;[^}]*transform:\s*translateY\(-50%\);/s
    );
  });
});
