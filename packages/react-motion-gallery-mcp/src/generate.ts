import path from "node:path";

import { getDemoCode, inferPrimaryDemoForPrompt, renameGeneratedComponent } from "./snippets.js";

export type GenerateGalleryComponentArgs = {
  demoId?: string;
  goal?: string;
  componentName?: string;
  cssModuleName?: string;
};

export function generateGalleryComponent(args: GenerateGalleryComponentArgs) {
  const demoId = args.demoId ?? inferPrimaryDemoForPrompt(args.goal ?? "");
  const demo = getDemoCode(demoId);
  const cssModuleName = args.cssModuleName ?? demo.cssFilename;
  const tsx = renameGeneratedComponent(demo.tsx, {
    componentName: args.componentName,
    cssModuleName,
  });

  return {
    demoId,
    componentName: args.componentName ?? inferExportedComponentName(tsx),
    files: {
      tsx,
      css: demo.css,
      cssModuleName,
      extraFiles: demo.extraFiles,
    },
    imports: demo.imports,
    notes: demo.notes,
  };
}

function inferExportedComponentName(tsx: string) {
  return tsx.match(/export function ([A-Za-z0-9_]+)/)?.[1] ?? "Gallery";
}

export function cssModuleNameForComponent(componentPath: string) {
  const basename = path.basename(componentPath).replace(/\.(tsx|jsx|ts|js)$/i, "");
  return `${basename}.module.css`;
}
