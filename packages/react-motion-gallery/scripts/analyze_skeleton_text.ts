import { isAbsolute, resolve } from "node:path";
import { installStripTypesResolutionHooks } from "./strip_types_runtime.ts";

installStripTypesResolutionHooks();

function parseArgs(argv: string[]): { inputPath?: string } {
  const args = [...argv];
  const next = () => args.shift();
  const parsed: { inputPath?: string } = {};

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

    throw new Error(`Unknown argument: ${token}`);
  }

  return parsed;
}

function resolveCliPath(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (isAbsolute(path)) return path;
  return resolve(process.env.INIT_CWD || process.cwd(), path);
}

const { inputPath } = parseArgs(process.argv.slice(2));
const { executeSkeletonTextAnalysisCli, formatCliJson } = await import(
  "../src/dev/skeleton-text/cli.ts"
);
const { exitCode, payload } = await executeSkeletonTextAnalysisCli({
  inputPath: resolveCliPath(inputPath),
});
process.stdout.write(formatCliJson(payload), () => process.exit(exitCode));
