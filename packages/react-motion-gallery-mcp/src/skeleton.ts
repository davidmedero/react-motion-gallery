import fs from "node:fs";
import path from "node:path";

import { resolveInsideRoot } from "./project.js";

export type SkeletonTargetInput = {
  exportName: string;
  selector: string;
  widthMode?: "barWidth" | "lastBarWidth" | "both";
  lineWrapGuardPx?: number;
};

type ResponsiveMetric = number | Record<string, number>;

export type SkeletonSliderInput = {
  itemSelector: string;
  canonicalItemIdAttribute: string;
  cloneAttribute?: string;
  cloneValue?: string;
  roles: Array<{
    role: string;
    selector: string;
    barHeight: ResponsiveMetric;
    lineHeight: ResponsiveMetric;
    lineWrapGuardPx?: number;
    style?: Record<string, unknown>;
  }>;
  trackedItems: Array<{
    itemId: string;
    roles: Array<{
      role: string;
      exportName: string;
      widthMode?: "barWidth" | "lastBarWidth" | "both";
    }>;
  }>;
  rowHeightCompensationExportName: string;
};

export type SkeletonMasonryInput = {
  rootSelector?: string;
  anchorSelector?: string;
  itemSelector: string;
  expectedItemCount?: number;
  columns?: Record<string, number>;
};

export type SkeletonEntriesInput = {
  rootSelector?: string;
  anchorSelector?: string;
  entrySelector?: string;
  expectedEntryCount?: number;
  mountedAttribute?: string;
  mountedValue?: string;
  readyAttribute?: string;
  readyValue?: string;
  timeoutMs?: number;
};

export type ScaffoldSkeletonTextArgs = {
  projectRoot: string;
  manifestPath: string;
  url: string;
  outputFile: string;
  moduleExportName: string;
  targets?: SkeletonTargetInput[];
  slider?: SkeletonSliderInput;
  masonry?: SkeletonMasonryInput;
  entries?: SkeletonEntriesInput;
  chromePath?: string;
  viewportMin?: number;
  viewportMax?: number;
  viewportHeight?: number;
  viewportWorkers?: number;
  settleMs?: number;
  stableGeometryFrames?: number;
  readyExpression?: string;
  lineWrapGuardPx?: number;
  lineMeasurementMethod?: "domRange";
  responsiveBy?: "viewport" | "container";
  breakpointStrategy?: "lineChanges" | "lineOrBarChanges";
  barWidthUnit?: "px" | "percent";
  includeTextMetrics?: boolean;
  apply?: boolean;
};

export function scaffoldSkeletonText(args: ScaffoldSkeletonTextArgs) {
  const hasTargets = (args.targets?.length ?? 0) > 0;
  const hasSlider = args.slider != null;

  if (!hasTargets && !hasSlider) {
    throw new Error("scaffold_skeleton_text requires targets or a slider manifest block.");
  }

  const manifest = stripUndefined({
    url: args.url,
    outputFile: args.outputFile,
    moduleExportName: args.moduleExportName,
    chromePath: args.chromePath,
    viewportMin: args.viewportMin ?? 320,
    viewportMax: args.viewportMax ?? 1600,
    viewportHeight: args.viewportHeight ?? 1800,
    viewportWorkers: args.viewportWorkers ?? 1,
    settleMs: args.settleMs ?? 120,
    stableGeometryFrames: args.stableGeometryFrames ?? 3,
    readyExpression: args.readyExpression,
    lineWrapGuardPx: args.lineWrapGuardPx ?? 0,
    lineMeasurementMethod: args.lineMeasurementMethod,
    includeTextMetrics: args.includeTextMetrics ?? true,
    breakpointStrategy: args.breakpointStrategy ?? "lineChanges",
    barWidthUnit: args.barWidthUnit ?? "px",
    ...(args.responsiveBy === "container" ? { responsiveBy: "container" } : null),
    ...(hasTargets
      ? {
          targets: args.targets!.map((target) =>
            stripUndefined({
              exportName: target.exportName,
              selector: target.selector,
              widthMode: target.widthMode,
              lineWrapGuardPx: target.lineWrapGuardPx,
            })
          ),
        }
      : null),
    ...(args.slider ? { slider: stripUndefined(args.slider) } : null),
    ...(args.masonry ? { masonry: stripUndefined(args.masonry) } : null),
    ...(args.entries ? { entries: stripUndefined(args.entries) } : null),
  });

  const targetPath = resolveInsideRoot(args.projectRoot, args.manifestPath);
  const code = `${JSON.stringify(manifest, null, 2)}\n`;
  const analysisOutputPath = analysisOutputFor(args.outputFile);

  if (args.apply) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, code);
  }

  return {
    applied: Boolean(args.apply),
    manifestPath: path.relative(path.resolve(args.projectRoot), targetPath),
    manifest,
    commands: [
      `npm run --silent generate:skeleton-text-module -- --input ${args.manifestPath} --analysis-output ${analysisOutputPath}`,
      `npm run --silent generate:skeleton-text-module -- --input ${args.manifestPath} --analysis-output ${analysisOutputPath} --print-analysis`,
    ],
  };
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripUndefined(entry)) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const out: Record<string, unknown> = {};
  for (const [key, entryValue] of Object.entries(value)) {
    if (entryValue !== undefined) {
      out[key] = stripUndefined(entryValue);
    }
  }
  return out as T;
}

function analysisOutputFor(outputFile: string) {
  if (outputFile.endsWith(".generated.ts")) {
    return outputFile.replace(/\.generated\.ts$/, ".measurements.json");
  }
  return `${outputFile}.measurements.json`;
}
