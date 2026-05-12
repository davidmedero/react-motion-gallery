import fs from "node:fs";

import { describe, expect, test } from "vitest";

import { componentCatalog, getDemoCatalog, getDemoById } from "./catalog.js";

describe("catalog", () => {
  test("loads demo metadata from the marketing demo registry", () => {
    const demos = getDemoCatalog();

    expect(demos.length).toBeGreaterThan(40);
    expect(getDemoById("slider-default")?.categoryId).toBe("slider");
    expect(getDemoById("grid-template-columns")?.tags).toContain("template-columns");
    expect(getDemoById("zoom-pan-standalone")?.categoryId).toBe("zoom-pan");
  });

  test("points every catalog demo at source and css files that exist", () => {
    for (const demo of getDemoCatalog()) {
      expect(fs.existsSync(demo.sourcePath), `${demo.id} source.ts`).toBe(true);
      expect(fs.existsSync(demo.cssPath), `${demo.id} css.ts`).toBe(true);
    }
  });

  test("keeps component category links valid", () => {
    const categories = new Set(getDemoCatalog().map((demo) => demo.categoryId));

    for (const component of componentCatalog) {
      expect(component.importPath.startsWith("react-motion-gallery")).toBe(true);
      expect(component.exports.length).toBeGreaterThan(0);
      for (const categoryId of component.categoryIds) {
        expect(categories.has(categoryId), `${component.id} category ${categoryId}`).toBe(true);
      }
    }
  });
});
