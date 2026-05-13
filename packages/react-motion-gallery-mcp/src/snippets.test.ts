import { describe, expect, test } from "vitest";

import { getDemoCode, normalizeDemoSource } from "./snippets.js";

describe("snippet normalization", () => {
  test("rewrites repo-local package imports to public package imports", () => {
    const demo = getDemoCode("slider-default");

    expect(demo.tsx).toContain('from "react-motion-gallery/slider"');
    expect(demo.tsx).toContain('from "react-motion-gallery/core"');
    expect(demo.tsx).not.toContain("packages/react-motion-gallery/src");
    expect(demo.css).toContain(".");
    expect(demo.notes).toContain('Import "react-motion-gallery/styles.css" once in your app shell.');
  });

  test("prefers subpath imports for narrow one-surface examples", () => {
    const demo = getDemoCode("zoom-pan-standalone");

    expect(demo.tsx).toContain('from "react-motion-gallery/zoomPan"');
    expect(demo.tsx).not.toContain('from "react-motion-gallery";');
  });

  test("converts internal skeleton type imports into public split skeleton subpaths", () => {
    const demo = getDemoCode("grid-template-columns");

    expect(demo.tsx).toContain("GridSkeletonSpec");
    expect(demo.tsx).toContain("SkeletonNode");
    expect(demo.tsx).toContain('from "react-motion-gallery/skeleton/grid";');
    expect(demo.tsx).not.toContain("Gallery/grid/GridSkeleton");
  });

  test("normalizes escaped template delimiters", () => {
    expect(normalizeDemoSource("const value = \\`hi\\`; const x = \\${name};")).toBe(
      "const value = `hi`; const x = ${name};"
    );
  });
});
