import fs from "node:fs";
import path from "node:path";

import { resolveInsideRoot } from "./project.js";

export type SkeletonTargetInput = {
  exportName: string;
  selector: string;
  widthMode?: "barWidth" | "lastBarWidth" | "both";
  barHeight?: number;
  lineHeight?: number;
};

export type ScaffoldSkeletonTextArgs = {
  projectRoot: string;
  manifestPath: string;
  url: string;
  outputFile: string;
  moduleExportName: string;
  targets: SkeletonTargetInput[];
  viewportMin?: number;
  viewportMax?: number;
  viewportHeight?: number;
  responsiveBy?: "viewport" | "container";
  breakpointStrategy?: "lineChanges" | "lineOrBarChanges";
  barWidthUnit?: "px" | "percent";
  includeTextMetrics?: boolean;
  apply?: boolean;
};

export function scaffoldSkeletonText(args: ScaffoldSkeletonTextArgs) {
  if (args.targets.length === 0) {
    throw new Error("scaffold_skeleton_text requires at least one target.");
  }

  const manifest = {
    url: args.url,
    outputFile: args.outputFile,
    moduleExportName: args.moduleExportName,
    viewportMin: args.viewportMin ?? 320,
    viewportMax: args.viewportMax ?? 1600,
    viewportHeight: args.viewportHeight ?? 1800,
    viewportWorkers: 1,
    settleMs: 120,
    stableGeometryFrames: 3,
    lineWrapGuardPx: 0,
    includeTextMetrics: args.includeTextMetrics ?? true,
    breakpointStrategy: args.breakpointStrategy ?? "lineChanges",
    barWidthUnit: args.barWidthUnit ?? "px",
    responsiveBy: args.responsiveBy ?? "viewport",
    targets: args.targets.map((target) => ({
      exportName: target.exportName,
      selector: target.selector,
      ...(target.widthMode ? { widthMode: target.widthMode } : {}),
      ...(target.barHeight ? { barHeight: target.barHeight } : {}),
      ...(target.lineHeight ? { lineHeight: target.lineHeight } : {}),
    })),
  };

  const targetPath = resolveInsideRoot(args.projectRoot, args.manifestPath);
  const code = `${JSON.stringify(manifest, null, 2)}\n`;

  if (args.apply) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, code);
  }

  return {
    applied: Boolean(args.apply),
    manifestPath: path.relative(path.resolve(args.projectRoot), targetPath),
    manifest,
    commands: [
      `npm run --silent generate:skeleton-text-module -- --input ${args.manifestPath}`,
      `npm run --silent generate:skeleton-text-module -- --input ${args.manifestPath} --analysis-output ${args.outputFile.replace(/\.generated\.ts$/, ".measurements.json")}`,
    ],
  };
}
