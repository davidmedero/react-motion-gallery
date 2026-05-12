import { isAbsolute, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { installStripTypesResolutionHooks } from "./strip_types_runtime.ts";

installStripTypesResolutionHooks();

function parseArgs(argv: string[]): {
  analysisOutputPath?: string;
  inputPath?: string;
  outputPath?: string;
  printAnalysis?: boolean;
} {
  const args = [...argv];
  const next = () => args.shift();
  const parsed: {
    analysisOutputPath?: string;
    inputPath?: string;
    outputPath?: string;
    printAnalysis?: boolean;
  } = {};

  while (args.length > 0) {
    const token = next();

    if (token === "--input") {
      const inputPath = next();
      if (!inputPath) {
        throw new Error("--input requires a file path.");
      }
      parsed.inputPath = inputPath;
      continue;
    }

    if (token === "--output") {
      const outputPath = next();
      if (!outputPath) {
        throw new Error("--output requires a file path.");
      }
      parsed.outputPath = outputPath;
      continue;
    }

    if (token === "--analysis-output") {
      const analysisOutputPath = next();
      if (!analysisOutputPath) {
        throw new Error("--analysis-output requires a file path.");
      }
      parsed.analysisOutputPath = analysisOutputPath;
      continue;
    }

    if (token === "--print-analysis") {
      parsed.printAnalysis = true;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return parsed;
}

const { analysisOutputPath, inputPath, outputPath, printAnalysis } = parseArgs(
  process.argv.slice(2)
);

if (!inputPath) {
  throw new Error("--input is required.");
}

function resolveCliPath(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (isAbsolute(path)) return path;
  return resolve(process.env.INIT_CWD || process.cwd(), path);
}

const {
  readCliJsonInput,
  formatCliJson,
  buildSkeletonTextAnalysisCliSuccess,
} = await import("../src/dev/skeleton-text/cli.ts");
const {
  parseBrowserSkeletonTextManifest,
  measureBrowserSkeletonTextManifest,
} = await import("../src/dev/skeleton-text/browser.ts");
const {
  buildGeneratedModuleFromBrowserMeasurements,
  renderSkeletonTextGeneratedModule,
  resolveGeneratedOutputFile,
} = await import("../src/dev/skeleton-text/generate.ts");
const { SkeletonTextAnalyzerError } = await import("../src/dev/skeleton-text/types.ts");

try {
  const resolvedInputPath = resolveCliPath(inputPath)!;
  const rawInput = await readCliJsonInput(resolvedInputPath);
  const manifest = parseBrowserSkeletonTextManifest(rawInput);
  const measurements = await measureBrowserSkeletonTextManifest(manifest);
  const generated = buildGeneratedModuleFromBrowserMeasurements({
    outputFile: manifest.outputFile,
    moduleExportName: manifest.moduleExportName,
    measurements,
  });
  const rendered = renderSkeletonTextGeneratedModule(generated);
  const resolvedOutputFile = resolveGeneratedOutputFile({
    manifestPath: resolvedInputPath,
    outputFile: generated.outputFile,
    outputPathOverride: resolveCliPath(outputPath),
  });
  const analysisPayload = buildSkeletonTextAnalysisCliSuccess(manifest, measurements);
  const resolvedAnalysisOutputFile = resolveCliPath(analysisOutputPath);

  await writeFile(resolvedOutputFile, rendered, "utf8");
  if (resolvedAnalysisOutputFile) {
    await writeFile(
      resolvedAnalysisOutputFile,
      formatCliJson(analysisPayload),
      "utf8"
    );
  }

  process.stdout.write(
    formatCliJson({
      outputFile: resolvedOutputFile,
      ...(resolvedAnalysisOutputFile
        ? { analysisOutputFile: resolvedAnalysisOutputFile }
        : null),
      exports: [
        ...generated.entries.map((entry) => entry.exportName),
        ...generated.responsiveNumberEntries.map((entry) => entry.exportName),
      ],
      moduleExportName: generated.moduleExportName,
      ...(printAnalysis ? { analysis: analysisPayload } : null),
    }),
    () => process.exit(0)
  );
} catch (error) {
  if (error instanceof SkeletonTextAnalyzerError) {
    process.stdout.write(
      formatCliJson({
        error: {
          code: error.code,
          message: error.message,
          detail: error.detail,
        },
      }),
      () => process.exit(1)
    );
  } else {
    throw error;
  }
}
