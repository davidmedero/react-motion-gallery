import path from "node:path";
import { fileURLToPath } from "node:url";

const inferredRepoRoot = path.resolve(
  fileURLToPath(new URL("../../..", import.meta.url))
);

export const repoRoot = process.env.RMG_REPO_ROOT
  ? path.resolve(process.env.RMG_REPO_ROOT)
  : inferredRepoRoot;

export function repoPath(...parts: string[]) {
  return path.join(repoRoot, ...parts);
}

export function toPosixPath(value: string) {
  return value.split(path.sep).join("/");
}
