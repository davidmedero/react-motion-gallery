import { readFile } from "node:fs/promises";
import {
  measureBrowserSkeletonTextManifest,
  parseBrowserSkeletonTextManifest,
  type BrowserSkeletonTextManifest,
  type BrowserSkeletonTextMeasurement,
} from "./browser";
import { SkeletonTextAnalyzerError } from "./types";

export type BrowserSkeletonTextAnalysisCliSuccess = {
  manifest: {
    url: string;
    viewportMin?: number;
    viewportMax?: number;
    viewportHeight?: number;
    viewportWorkers?: number;
    settleMs?: number;
    stableGeometryFrames?: number;
    readyExpression?: string;
    lineWrapGuardPx?: number;
    lineMeasurementMethod?: BrowserSkeletonTextManifest["lineMeasurementMethod"];
    includeTextMetrics?: boolean;
    breakpointStrategy?: BrowserSkeletonTextManifest["breakpointStrategy"];
    barWidthUnit?: BrowserSkeletonTextManifest["barWidthUnit"];
    masonry?: BrowserSkeletonTextManifest["masonry"];
    entries?: BrowserSkeletonTextManifest["entries"];
  };
  results: Array<
    | ({
        kind: "text";
        exportName: string;
      } & Extract<BrowserSkeletonTextMeasurement, { kind: "text" }>["value"])
    | {
        kind: "responsiveNumber";
        exportName: string;
        value: Extract<
          BrowserSkeletonTextMeasurement,
          { kind: "responsiveNumber" }
        >["value"];
      }
  >;
};

export type BrowserSkeletonTextAnalysisCliFailure = {
  error: {
    code: string;
    message: string;
    detail: Record<string, unknown>;
  };
};

export function buildSkeletonTextAnalysisCliSuccess(
  manifest: BrowserSkeletonTextManifest,
  measurements: BrowserSkeletonTextMeasurement[]
): BrowserSkeletonTextAnalysisCliSuccess {
  return {
    manifest: {
      url: manifest.url,
      ...(manifest.viewportMin != null ? { viewportMin: manifest.viewportMin } : null),
      ...(manifest.viewportMax != null ? { viewportMax: manifest.viewportMax } : null),
      ...(manifest.viewportHeight != null
        ? { viewportHeight: manifest.viewportHeight }
        : null),
      ...(manifest.viewportWorkers != null
        ? { viewportWorkers: manifest.viewportWorkers }
        : null),
      ...(manifest.settleMs != null
        ? { settleMs: manifest.settleMs }
        : null),
      ...(manifest.stableGeometryFrames != null
        ? { stableGeometryFrames: manifest.stableGeometryFrames }
        : null),
      ...(manifest.readyExpression != null
        ? { readyExpression: manifest.readyExpression }
        : null),
      ...(manifest.lineWrapGuardPx != null
        ? { lineWrapGuardPx: manifest.lineWrapGuardPx }
        : null),
      ...(manifest.lineMeasurementMethod != null
        ? { lineMeasurementMethod: manifest.lineMeasurementMethod }
        : null),
      ...(manifest.includeTextMetrics != null
        ? { includeTextMetrics: manifest.includeTextMetrics }
        : null),
      ...(manifest.breakpointStrategy != null
        ? { breakpointStrategy: manifest.breakpointStrategy }
        : null),
      ...(manifest.barWidthUnit != null
        ? { barWidthUnit: manifest.barWidthUnit }
        : null),
      ...(manifest.masonry != null ? { masonry: manifest.masonry } : null),
      ...(manifest.entries != null ? { entries: manifest.entries } : null),
    },
    results: measurements.map((measurement) =>
      measurement.kind === "text"
        ? {
            kind: "text" as const,
            exportName: measurement.exportName,
            ...measurement.value,
          }
        : {
            kind: "responsiveNumber" as const,
            exportName: measurement.exportName,
            value: measurement.value,
          }
    ),
  };
}

function toCliError(error: unknown): BrowserSkeletonTextAnalysisCliFailure {
  if (error instanceof SkeletonTextAnalyzerError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        detail: error.detail,
      },
    };
  }

  if (error instanceof Error) {
    return {
      error: {
        code: "UNEXPECTED_ERROR",
        message: error.message,
        detail: {},
      },
    };
  }

  return {
    error: {
      code: "UNEXPECTED_ERROR",
      message: "An unexpected non-Error value was thrown.",
      detail: { error },
    },
  };
}

export async function readCliJsonInput(inputPath?: string): Promise<unknown> {
  const raw = inputPath
    ? await readFile(inputPath, "utf8")
    : await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];

        process.stdin.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
        });
        process.stdin.on("end", () => {
          resolve(Buffer.concat(chunks).toString("utf8"));
        });
        process.stdin.on("error", reject);
      });

  return JSON.parse(raw);
}

export function formatCliJson(
  payload: BrowserSkeletonTextAnalysisCliSuccess | BrowserSkeletonTextAnalysisCliFailure | Record<string, unknown>
): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export async function executeSkeletonTextAnalysisCli(args: {
  inputPath?: string;
}): Promise<{
  exitCode: number;
  payload: BrowserSkeletonTextAnalysisCliSuccess | BrowserSkeletonTextAnalysisCliFailure;
}> {
  try {
    const rawInput = await readCliJsonInput(args.inputPath);
    const manifest = parseBrowserSkeletonTextManifest(rawInput);
    const measurements = await measureBrowserSkeletonTextManifest(manifest);

    return {
      exitCode: 0,
      payload: buildSkeletonTextAnalysisCliSuccess(manifest, measurements),
    };
  } catch (error) {
    return {
      exitCode: 1,
      payload: toCliError(error),
    };
  }
}
