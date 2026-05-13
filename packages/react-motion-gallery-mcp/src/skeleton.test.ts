import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { scaffoldSkeletonText } from "./skeleton.js";

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "rmg-mcp-skeleton-"));
}

describe("skeleton text scaffolding", () => {
  test("creates flat-target manifests as dry runs by default", () => {
    const root = tempRoot();
    const result = scaffoldSkeletonText({
      projectRoot: root,
      manifestPath: "src/pricing.skeleton-text.browser.manifest.json",
      url: "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
      outputFile: "src/pricing.skeleton-text.generated.ts",
      moduleExportName: "pricingSkeletonText",
      targets: [
        {
          exportName: "pricingCardTitle",
          selector: "[data-skeleton-text-id='pricingCardTitle']",
        },
      ],
    });

    expect(result.applied).toBe(false);
    expect(result.manifest.targets).toEqual([
      {
        exportName: "pricingCardTitle",
        selector: "[data-skeleton-text-id='pricingCardTitle']",
      },
    ]);
    expect(result.commands[0]).toContain("--analysis-output src/pricing.skeleton-text.measurements.json");
    expect(fs.existsSync(path.join(root, "src", "pricing.skeleton-text.browser.manifest.json"))).toBe(false);
  });

  test("writes manifests only when apply is true", () => {
    const root = tempRoot();
    scaffoldSkeletonText({
      projectRoot: root,
      manifestPath: "src/gallery.skeleton-text.browser.manifest.json",
      url: "http://127.0.0.1:3000/gallery",
      outputFile: "src/gallery.skeleton-text.generated.ts",
      moduleExportName: "gallerySkeletonText",
      targets: [{ exportName: "title", selector: "[data-title]" }],
      apply: true,
    });

    expect(
      fs.readFileSync(path.join(root, "src", "gallery.skeleton-text.browser.manifest.json"), "utf8")
    ).toContain('"moduleExportName": "gallerySkeletonText"');
  });

  test("supports slider mode with row-height compensation", () => {
    const root = tempRoot();
    const result = scaffoldSkeletonText({
      projectRoot: root,
      manifestPath: "slider.skeleton-text.browser.manifest.json",
      url: "http://127.0.0.1:3000/slider",
      outputFile: "slider.skeleton-text.generated.ts",
      moduleExportName: "sliderSkeletonText",
      slider: {
        itemSelector: "[data-skeleton-item-id]",
        canonicalItemIdAttribute: "data-skeleton-item-id",
        roles: [
          {
            role: "title",
            selector: "[data-skeleton-role='title']",
            barHeight: 13,
            lineHeight: 1.5,
          },
        ],
        trackedItems: [
          {
            itemId: "cardOne",
            roles: [{ role: "title", exportName: "cardOneTitle" }],
          },
        ],
        rowHeightCompensationExportName: "sliderRowHeightCompensation",
      },
    });

    expect(result.manifest.slider?.rowHeightCompensationExportName).toBe(
      "sliderRowHeightCompensation"
    );
  });

  test("supports masonry readiness metadata with targets", () => {
    const root = tempRoot();
    const result = scaffoldSkeletonText({
      projectRoot: root,
      manifestPath: "masonry.skeleton-text.browser.manifest.json",
      url: "http://127.0.0.1:3000/masonry",
      outputFile: "masonry.skeleton-text.generated.ts",
      moduleExportName: "masonrySkeletonText",
      masonry: {
        anchorSelector: "[data-skeleton-text-id='itemBody']",
        itemSelector: "[data-rmg-idx]",
        expectedItemCount: 8,
        columns: { "0": 1, "760": 2 },
      },
      targets: [{ exportName: "itemBody", selector: "[data-skeleton-text-id='itemBody']" }],
    });

    expect(result.manifest.masonry).toMatchObject({
      itemSelector: "[data-rmg-idx]",
      expectedItemCount: 8,
    });
  });

  test("supports entries readiness metadata with targets", () => {
    const root = tempRoot();
    const result = scaffoldSkeletonText({
      projectRoot: root,
      manifestPath: "entries.skeleton-text.browser.manifest.json",
      url: "http://127.0.0.1:3000/entries",
      outputFile: "entries.skeleton-text.generated.ts",
      moduleExportName: "entriesSkeletonText",
      entries: {
        entrySelector: "[data-rmg-entry-owner]",
        expectedEntryCount: 3,
      },
      targets: [{ exportName: "entryTitle", selector: "[data-skeleton-text-id='entryTitle']" }],
    });

    expect(result.manifest.entries).toMatchObject({
      entrySelector: "[data-rmg-entry-owner]",
      expectedEntryCount: 3,
    });
  });
});
