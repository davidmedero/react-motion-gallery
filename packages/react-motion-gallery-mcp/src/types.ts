export type DemoCategoryId =
  | "slider"
  | "grid"
  | "masonry"
  | "entries"
  | "zoom-pan"
  | "fullscreen"
  | "skeleton"
  | "reveal";

export type ComponentSurface = {
  id: string;
  name: string;
  importPath: string;
  exports: string[];
  categoryIds: DemoCategoryId[];
  description: string;
  whenToUse: string[];
  relatedTags: string[];
  optionalPeerDependencies?: string[];
};

export type DemoMetadata = {
  id: string;
  title: string;
  eyebrow: string;
  tags: string[];
  categoryId: DemoCategoryId;
  demoPath: string;
  sourcePath: string;
  cssPath: string;
  sourceFilename: string;
  cssFilename: string;
};

export type DemoCode = DemoMetadata & {
  tsx: string;
  css: string;
  extraFiles: GeneratedExtraFile[];
  imports: string[];
  notes: string[];
};

export type GeneratedExtraFile = {
  path: string;
  filename: string;
  code: string;
  language: "ts" | "tsx" | "css" | "json";
};

export type ProjectKind = "next" | "vite" | "react" | "unknown";

export type ProjectInfo = {
  root: string;
  kind: ProjectKind;
  packageJsonPath: string | null;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  reactVersion: string | null;
  hasReactMotionGallery: boolean;
  hasRmgStylesImport: boolean;
  hasVideoPeers: boolean;
  usesCssModules: boolean;
};

export type AuditFinding = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  file?: string;
};
