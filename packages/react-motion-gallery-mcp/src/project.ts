import fs from "node:fs";
import path from "node:path";

import type { AuditFinding, GeneratedExtraFile, ProjectInfo } from "./types.js";

const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const ignoredDirectories = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "storybook-static",
]);

export function resolveInsideRoot(projectRoot: string, targetPath: string) {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, targetPath);
  const relative = path.relative(root, resolved);

  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return resolved;
  }

  throw new Error(`Refusing to write outside projectRoot: ${targetPath}`);
}

export function detectProject(projectRoot: string): ProjectInfo {
  const root = path.resolve(projectRoot);
  const packageJsonPath = path.join(root, "package.json");
  const packageJson = readJsonObject(packageJsonPath);
  const dependencies = objectRecord(packageJson?.dependencies);
  const devDependencies = objectRecord(packageJson?.devDependencies);
  const allDeps = { ...dependencies, ...devDependencies };

  const files = listSourceFiles(root, 400);
  const hasRmgStylesImport = files.some((file) =>
    fs.readFileSync(file, "utf8").includes("react-motion-gallery/styles.css")
  );
  const usesCssModules = files.some((file) => file.endsWith(".module.css"));

  return {
    root,
    kind: detectProjectKind(allDeps),
    packageJsonPath: fs.existsSync(packageJsonPath) ? packageJsonPath : null,
    dependencies,
    devDependencies,
    reactVersion: allDeps.react ?? null,
    hasReactMotionGallery: Boolean(allDeps["react-motion-gallery"]),
    hasRmgStylesImport,
    hasVideoPeers: Boolean(allDeps.plyr && allDeps["plyr-react"]),
    usesCssModules,
  };
}

export function auditProject(projectRoot: string) {
  const project = detectProject(projectRoot);
  const findings: AuditFinding[] = [];

  if (!project.packageJsonPath) {
    findings.push({
      severity: "error",
      code: "missing-package-json",
      message: "No package.json was found at projectRoot.",
    });
  }

  if (!project.hasReactMotionGallery) {
    findings.push({
      severity: "error",
      code: "missing-react-motion-gallery",
      message: "Install react-motion-gallery before using generated examples.",
    });
  }

  if (!project.hasRmgStylesImport) {
    findings.push({
      severity: "warning",
      code: "missing-rmg-styles",
      message: 'Import "react-motion-gallery/styles.css" once in the app shell or global client entry.',
    });
  }

  const files = listSourceFiles(project.root, 500);
  const rmgFiles = files.filter((file) =>
    fs.readFileSync(file, "utf8").includes("react-motion-gallery")
  );
  const videoLikely = rmgFiles.some((file) => /Video|kind:\s*"video"|youtube|vimeo/i.test(fs.readFileSync(file, "utf8")));

  if (videoLikely && !project.hasVideoPeers) {
    findings.push({
      severity: "warning",
      code: "missing-video-peers",
      message: "Video integrations need optional peer dependencies plyr and plyr-react.",
    });
  }

  if (project.kind === "next") {
    for (const file of rmgFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (usesInteractiveGallery(content) && !hasUseClientDirective(content)) {
        findings.push({
          severity: "warning",
          code: "next-use-client",
          file: path.relative(project.root, file),
          message: 'This Next.js file imports interactive gallery surfaces but does not start with "use client".',
        });
      }
    }
  }

  if (findings.length === 0) {
    findings.push({
      severity: "info",
      code: "audit-clean",
      message: "No React Motion Gallery integration issues were found in the scanned files.",
    });
  }

  return { project, findings };
}

export function writeGalleryFiles(args: {
  projectRoot: string;
  componentPath: string;
  cssPath?: string;
  tsx: string;
  css?: string;
  extraFiles?: GeneratedExtraFile[];
  apply?: boolean;
}) {
  const componentTarget = resolveInsideRoot(args.projectRoot, args.componentPath);
  const files = [
    {
      path: componentTarget,
      relativePath: path.relative(path.resolve(args.projectRoot), componentTarget),
      code: args.tsx,
    },
  ];

  if (args.cssPath && args.css !== undefined) {
    const cssTarget = resolveInsideRoot(args.projectRoot, args.cssPath);
    files.push({
      path: cssTarget,
      relativePath: path.relative(path.resolve(args.projectRoot), cssTarget),
      code: args.css,
    });
  }

  for (const extraFile of args.extraFiles ?? []) {
    const extraTarget = resolveInsideRoot(
      args.projectRoot,
      path.join(path.dirname(args.componentPath), extraFile.path)
    );
    files.push({
      path: extraTarget,
      relativePath: path.relative(path.resolve(args.projectRoot), extraTarget),
      code: extraFile.code,
    });
  }

  if (args.apply) {
    for (const file of files) {
      fs.mkdirSync(path.dirname(file.path), { recursive: true });
      fs.writeFileSync(file.path, `${file.code.trimEnd()}\n`);
    }
  }

  return {
    applied: Boolean(args.apply),
    files: files.map((file) => ({
      path: file.relativePath,
      bytes: Buffer.byteLength(file.code),
    })),
  };
}

export function listSourceFiles(root: string, maxFiles: number) {
  const files: string[] = [];
  walk(root, files, maxFiles);
  return files;
}

function walk(currentPath: string, files: string[], maxFiles: number) {
  if (files.length >= maxFiles || !fs.existsSync(currentPath)) {
    return;
  }

  const stat = fs.statSync(currentPath);
  if (stat.isFile()) {
    if (sourceExtensions.has(path.extname(currentPath)) || currentPath.endsWith(".module.css")) {
      files.push(currentPath);
    }
    return;
  }

  if (!stat.isDirectory()) {
    return;
  }

  const basename = path.basename(currentPath);
  if (ignoredDirectories.has(basename)) {
    return;
  }

  for (const child of fs.readdirSync(currentPath)) {
    walk(path.join(currentPath, child), files, maxFiles);
    if (files.length >= maxFiles) {
      return;
    }
  }
}

function readJsonObject(filePath: string): Record<string, unknown> | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function objectRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

function detectProjectKind(dependencies: Record<string, string>) {
  if (dependencies.next) return "next";
  if (dependencies.vite || dependencies["@vitejs/plugin-react"]) return "vite";
  if (dependencies.react) return "react";
  return "unknown";
}

function hasUseClientDirective(source: string) {
  const trimmed = source.trimStart();
  return trimmed.startsWith('"use client"') || trimmed.startsWith("'use client'");
}

function usesInteractiveGallery(source: string) {
  return /Slider|Grid|Masonry|Entries|useFullscreenController|ThumbnailSlider|ZoomPanImage|Video|Skeleton/.test(
    source
  );
}
