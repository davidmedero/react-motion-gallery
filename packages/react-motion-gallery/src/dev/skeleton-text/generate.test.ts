import { describe, expect, test } from "vitest";
import {
  buildGeneratedModuleFromBrowserMeasurements,
  renderSkeletonTextGeneratedModule,
  resolveGeneratedOutputFile,
} from "./generate";
import { SkeletonTextAnalyzerError } from "./types";

describe("browser skeleton text module generation", () => {
  test("renders a generated TS module from browser measurements", () => {
    const generated = buildGeneratedModuleFromBrowserMeasurements({
      outputFile: "./Component.skeleton-text.generated.ts",
      moduleExportName: "templateColumnsSkeletonText",
      measurements: [
        {
          kind: "text",
          exportName: "leadTitle",
          textId: "lead-title",
          value: {
            lines: 1,
            barWidth: "284px",
            barHeight: 16,
            lineHeight: 1.2,
            responsiveBy: "container",
            segments: [],
          },
        },
        {
          kind: "responsiveNumber",
          exportName: "sliderCardsRowHeightCompensation",
          value: {
            0: 0,
            768: 20.8,
          },
        },
      ],
    });
    const rendered = renderSkeletonTextGeneratedModule(generated);

    expect(generated.moduleExportName).toBe("templateColumnsSkeletonText");
    expect(rendered).toContain("type GeneratedSkeletonTextEntry = {");
    expect(rendered).toContain(
      "type GeneratedSkeletonResponsiveNumber = number | Record<number, number>;"
    );
    expect(rendered).toContain(
      "export const leadTitle: GeneratedSkeletonTextEntry = {"
    );
    expect(rendered).toContain("\"textId\": \"lead-title\"");
    expect(rendered).toContain(
      "export const sliderCardsRowHeightCompensation: GeneratedSkeletonResponsiveNumber = {"
    );
    expect(rendered).toContain("\"lines\": 1");
    expect(rendered).toContain("\"barWidth\": \"284px\"");
    expect(rendered).toContain("\"barHeight\": 16");
    expect(rendered).toContain("\"lineHeight\": 1.2");
    expect(rendered).toContain("\"responsiveBy\": \"container\"");
    expect(rendered).toContain(
      "export const templateColumnsSkeletonText: GeneratedSkeletonTextModule = {"
    );
    expect(rendered).not.toContain("sliderCardsRowHeightCompensation,");
    expect(
      resolveGeneratedOutputFile({
        manifestPath:
          "/Users/davidmedero/Documents/react-motion-gallery/apps/marketing/demo/skeleton-text.browser.manifest.json",
        outputFile: generated.outputFile,
      })
    ).toBe(
      "/Users/davidmedero/Documents/react-motion-gallery/apps/marketing/demo/Component.skeleton-text.generated.ts"
    );
  });

  test("requires output file metadata", () => {
    expect(() =>
      resolveGeneratedOutputFile({
        manifestPath: "/tmp/example.manifest.json",
      })
    ).toThrowError(SkeletonTextAnalyzerError);
  });
});
