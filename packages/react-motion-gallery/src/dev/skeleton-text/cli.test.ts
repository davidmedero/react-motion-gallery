import { describe, expect, test } from "vitest";
import { buildSkeletonTextAnalysisCliSuccess, formatCliJson } from "./cli";
import { parseBrowserSkeletonTextManifest } from "./browser";
import { SkeletonTextAnalyzerError } from "./types";

describe("browser skeleton text CLI helpers", () => {
  test("parses a browser manifest and preserves selector metadata", () => {
    const manifest = parseBrowserSkeletonTextManifest({
      url: "http://127.0.0.1:3000/demos?demo=grid-template-columns",
      viewportMin: 320,
      viewportMax: 1600,
      viewportWorkers: 4,
      settleMs: 120,
      stableGeometryFrames: 12,
      readyExpression: "window.__demoReady === true",
      lineWrapGuardPx: 5.5,
      lineMeasurementMethod: "domRange",
      includeTextMetrics: true,
      breakpointStrategy: "lineChanges",
      barWidthUnit: "px",
      responsiveBy: "container",
      targets: [
        {
          exportName: "leadTitle",
          selector: "[data-skeleton-text-id='leadTitle']",
        },
        {
          exportName: "leadBody",
          selector: "[data-skeleton-text-id='leadBody']",
          lineWrapGuardPx: 2,
          widthMode: "both",
          responsiveBy: "container",
        },
      ],
    });

    expect(manifest.url).toContain("grid-template-columns");
    expect(manifest.breakpointStrategy).toBe("lineChanges");
    expect(manifest.barWidthUnit).toBe("px");
    expect(manifest.viewportWorkers).toBe(4);
    expect(manifest.settleMs).toBe(120);
    expect(manifest.stableGeometryFrames).toBe(12);
    expect(manifest.readyExpression).toBe("window.__demoReady === true");
    expect(manifest.lineWrapGuardPx).toBe(5.5);
    expect(manifest.lineMeasurementMethod).toBe("domRange");
    expect(manifest.includeTextMetrics).toBe(true);
    expect(manifest.targets?.[1]?.lineWrapGuardPx).toBe(2);
    expect(manifest.targets?.[1]?.widthMode).toBe("both");
    expect(
      formatCliJson({
        manifest: {
          url: manifest.url,
          stableGeometryFrames: manifest.stableGeometryFrames,
          readyExpression: manifest.readyExpression,
          lineMeasurementMethod: manifest.lineMeasurementMethod,
          includeTextMetrics: manifest.includeTextMetrics,
          breakpointStrategy: manifest.breakpointStrategy,
          barWidthUnit: manifest.barWidthUnit,
        },
        results: [
          {
            kind: "text",
            exportName: "leadTitle",
            lines: 1,
            barWidth: "284px",
            barHeight: 16,
            lineHeight: 1.2,
            segments: [],
          },
          {
            kind: "responsiveNumber",
            exportName: "gridRowHeightCompensation",
            value: {
              0: 0,
              900: 20.8,
            },
          },
        ],
      })
    ).toContain("\"exportName\": \"leadTitle\"");
    expect(
      formatCliJson({
        manifest: {
          url: manifest.url,
        },
        results: [
          {
            kind: "responsiveNumber",
            exportName: "gridRowHeightCompensation",
            value: 20.8,
          },
        ],
      })
    ).toContain("\"kind\": \"responsiveNumber\"");
  });

  test("parses slider manifests with tracked roles and compensation export metadata", () => {
    const manifest = parseBrowserSkeletonTextManifest({
      url: "http://127.0.0.1:3000/demos?demo=slider-cards&skeletonMeasure=content",
      slider: {
        itemSelector: "[data-skeleton-item-id]",
        canonicalItemIdAttribute: "data-skeleton-item-id",
        roles: [
          {
            role: "title",
            selector: "[data-skeleton-role='title']",
            barHeight: 13,
            lineHeight: 1.6,
          },
        ],
        trackedItems: [
          {
            itemId: "cardOne",
            roles: [
              {
                role: "title",
                exportName: "cardOneTitle",
              },
            ],
          },
        ],
        rowHeightCompensationExportName: "sliderCardsRowHeightCompensation",
      },
    });

    expect(manifest.slider?.trackedItems[0]?.roles[0]?.exportName).toBe("cardOneTitle");
    expect(manifest.slider?.rowHeightCompensationExportName).toBe(
      "sliderCardsRowHeightCompensation"
    );
  });

  test("parses masonry manifests with item geometry readiness metadata", () => {
    const manifest = parseBrowserSkeletonTextManifest({
      url: "http://127.0.0.1:3000/demos?demo=masonry-spans&skeletonMeasure=content",
      targets: [
        {
          exportName: "masonrySpansItem01Body",
          selector: "[data-skeleton-text-id='masonrySpansItem01Body']",
        },
      ],
      masonry: {
        anchorSelector: "[data-skeleton-text-id='masonrySpansItem01Body']",
        itemSelector: "[data-rmg-idx]",
        expectedItemCount: 8,
        columns: { 0: 1, 760: 2, 1160: 4 },
      },
    });

    expect(manifest.masonry).toEqual({
      anchorSelector: "[data-skeleton-text-id='masonrySpansItem01Body']",
      itemSelector: "[data-rmg-idx]",
      expectedItemCount: 8,
      columns: { 0: 1, 760: 2, 1160: 4 },
    });
    expect(
      buildSkeletonTextAnalysisCliSuccess(manifest, [
        {
          kind: "text",
          exportName: "masonrySpansItem01Body",
          value: {
            lines: 2,
            barWidth: ["220px", "160px"],
            barHeight: 14.72,
            lineHeight: 1.55,
            segments: [],
          },
        },
      ]).manifest.masonry
    ).toEqual(manifest.masonry);
  });

  test("parses entries manifests with mount and reveal readiness metadata", () => {
    const manifest = parseBrowserSkeletonTextManifest({
      url: "http://127.0.0.1:3000/demos?demo=entries-slider&skeletonMeasure=content",
      targets: [
        {
          exportName: "entriesSliderEntry01Body",
          selector: "[data-skeleton-text-id='entriesSliderEntry01Body']",
        },
      ],
      entries: {
        expectedEntryCount: 3,
      },
    });

    expect(manifest.entries).toEqual({
      entrySelector: "[data-rmg-entry-owner]",
      expectedEntryCount: 3,
      mountedAttribute: "data-rmg-entry-mounted",
      mountedValue: "1",
      readyAttribute: "data-rmg-entry-ready",
      readyValue: "1",
    });
    expect(
      buildSkeletonTextAnalysisCliSuccess(manifest, [
        {
          kind: "text",
          exportName: "entriesSliderEntry01Body",
          value: {
            lines: 2,
            barWidth: ["220px", "160px"],
            barHeight: 14.72,
            lineHeight: 1.55,
            segments: [],
          },
        },
      ]).manifest.entries
    ).toEqual(manifest.entries);
  });

  test("builds reusable analysis payloads from existing measurements", () => {
    const manifest = parseBrowserSkeletonTextManifest({
      url: "http://127.0.0.1:3000/demos?demo=grid-template-columns",
      viewportMin: 320,
      viewportMax: 1600,
      includeTextMetrics: true,
      targets: [
        {
          exportName: "leadTitle",
          selector: "[data-skeleton-text-id='leadTitle']",
        },
      ],
    });

    expect(
      buildSkeletonTextAnalysisCliSuccess(manifest, [
        {
          kind: "text",
          exportName: "leadTitle",
          value: {
            lines: 1,
            barWidth: "284px",
            barHeight: 16,
            lineHeight: 1.2,
            segments: [],
          },
        },
      ])
    ).toEqual({
      manifest: {
        url: manifest.url,
        viewportMin: 320,
        viewportMax: 1600,
        includeTextMetrics: true,
      },
      results: [
        {
          kind: "text",
          exportName: "leadTitle",
          lines: 1,
          barWidth: "284px",
          barHeight: 16,
          lineHeight: 1.2,
          segments: [],
        },
      ],
    });
  });

  test("throws a structured validation error when targets are missing", () => {
    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=grid-template-columns",
      })
    ).toThrowError(SkeletonTextAnalyzerError);
  });

  test("rejects unsupported browser measurement methods", () => {
    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=grid-template-columns",
        lineMeasurementMethod: "unsupported",
        targets: [
          {
            exportName: "leadTitle",
            selector: "[data-skeleton-text-id='leadTitle']",
          },
        ],
      })
    ).toThrowError(SkeletonTextAnalyzerError);
  });

  test("rejects viewport-keyed browser text manifests", () => {
    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=grid-template-columns",
        responsiveBy: "viewport",
        targets: [
          {
            exportName: "leadTitle",
            selector: "[data-skeleton-text-id='leadTitle']",
          },
        ],
      })
    ).toThrowError(SkeletonTextAnalyzerError);

    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=grid-template-columns",
        targets: [
          {
            exportName: "leadTitle",
            selector: "[data-skeleton-text-id='leadTitle']",
            responsiveBy: "viewport",
          },
        ],
      })
    ).toThrowError(SkeletonTextAnalyzerError);
  });

  test("rejects masonry manifests without a root or anchor selector", () => {
    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=masonry-spans",
        targets: [
          {
            exportName: "body",
            selector: "[data-skeleton-text-id='body']",
          },
        ],
        masonry: {
          itemSelector: "[data-rmg-idx]",
        },
      })
    ).toThrowError(SkeletonTextAnalyzerError);
  });

  test("rejects invalid masonry expected item counts", () => {
    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=masonry-spans",
        targets: [
          {
            exportName: "body",
            selector: "[data-skeleton-text-id='body']",
          },
        ],
        masonry: {
          anchorSelector: "[data-skeleton-text-id='body']",
          itemSelector: "[data-rmg-idx]",
          expectedItemCount: 0,
        },
      })
    ).toThrowError(SkeletonTextAnalyzerError);
  });

  test("rejects invalid masonry columns", () => {
    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=masonry-spans",
        targets: [
          {
            exportName: "body",
            selector: "[data-skeleton-text-id='body']",
          },
        ],
        masonry: {
          anchorSelector: "[data-skeleton-text-id='body']",
          itemSelector: "[data-rmg-idx]",
          columns: { mobile: 1, 760: 0 },
        },
      })
    ).toThrowError(SkeletonTextAnalyzerError);
  });

  test("rejects invalid entries readiness metadata", () => {
    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=entries-slider",
        targets: [
          {
            exportName: "body",
            selector: "[data-skeleton-text-id='body']",
          },
        ],
        entries: {
          expectedEntryCount: 0,
        },
      })
    ).toThrowError(SkeletonTextAnalyzerError);

    expect(() =>
      parseBrowserSkeletonTextManifest({
        url: "http://127.0.0.1:3000/demos?demo=entries-slider",
        targets: [
          {
            exportName: "body",
            selector: "[data-skeleton-text-id='body']",
          },
        ],
        entries: {
          readyAttribute: "",
        },
      })
    ).toThrowError(SkeletonTextAnalyzerError);
  });
});
