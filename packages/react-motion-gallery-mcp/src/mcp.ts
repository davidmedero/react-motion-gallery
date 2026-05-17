import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  componentCatalog,
  getCategoryDescriptions,
  getDemoCatalog,
  serializeDemoMetadata,
} from "./catalog.js";
import { jsonContent } from "./content.js";
import {
  agentBriefGuide,
  browserMeasuredSkeletonGuide,
  layoutSelectionGuide,
  listPackageDocResources,
  listPackageDocs,
  loadingFidelityGuide,
  readPackageDoc,
  skeletonCacheGuide,
} from "./docs.js";
import { cssModuleNameForComponent, generateGalleryComponent } from "./generate.js";
import { auditProject, writeGalleryFiles } from "./project.js";
import { recommendPattern, searchDemos } from "./recommend.js";
import { scaffoldSkeletonText } from "./skeleton.js";
import { getDemoCode } from "./snippets.js";
import type { DemoCategoryId } from "./types.js";
import { classifyGalleryWorkflow } from "./workflow.js";

const categorySchema = z.enum([
  "slider",
  "grid",
  "masonry",
  "entries",
  "zoom-pan",
  "fullscreen",
  "skeleton",
]);

const frameworkSchema = z.enum(["next", "vite", "react", "unknown"]);
const layoutHintSchema = categorySchema.or(z.enum(["app-shell", "flex", "custom", "any"]));
const widthModeSchema = z.enum(["barWidth", "lastBarWidth", "both"]);
const responsiveMetricSchema = z.number().or(z.record(z.string(), z.number()));
const skeletonTargetSchema = z.object({
  exportName: z.string(),
  selector: z.string(),
  widthMode: widthModeSchema.optional(),
  lineWrapGuardPx: z.number().min(0).optional(),
});
const skeletonSliderSchema = z.object({
  itemSelector: z.string(),
  canonicalItemIdAttribute: z.string(),
  cloneAttribute: z.string().optional(),
  cloneValue: z.string().optional(),
  roles: z.array(
    z.object({
      role: z.string(),
      selector: z.string(),
      barHeight: responsiveMetricSchema,
      lineHeight: responsiveMetricSchema,
      lineWrapGuardPx: z.number().min(0).optional(),
      style: z.record(z.string(), z.unknown()).optional(),
    })
  ),
  trackedItems: z.array(
    z.object({
      itemId: z.string(),
      roles: z.array(
        z.object({
          role: z.string(),
          exportName: z.string(),
          widthMode: widthModeSchema.optional(),
        })
      ),
    })
  ),
  rowHeightCompensationExportName: z.string(),
});
const skeletonMasonrySchema = z.object({
  rootSelector: z.string().optional(),
  anchorSelector: z.string().optional(),
  itemSelector: z.string(),
  expectedItemCount: z.number().int().min(1).optional(),
  columns: z.record(z.string(), z.number()).optional(),
});
const skeletonEntriesSchema = z.object({
  rootSelector: z.string().optional(),
  anchorSelector: z.string().optional(),
  entrySelector: z.string().optional(),
  expectedEntryCount: z.number().int().min(1).optional(),
  mountedAttribute: z.string().optional(),
  mountedValue: z.string().optional(),
  readyAttribute: z.string().optional(),
  readyValue: z.string().optional(),
  timeoutMs: z.number().min(0).optional(),
});

export function createRmgMcpServer() {
  const server = new McpServer({
    name: "react-motion-gallery-mcp",
    version: "0.1.0",
  });

  registerResources(server);
  registerTools(server);
  registerPrompts(server);

  return server;
}

function registerResources(server: McpServer) {
  server.resource("agent brief", "rmg://context/agent-brief", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: agentBriefGuide(),
      },
    ],
  }));

  server.resource("component catalog", "rmg://catalog/components", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({ components: componentCatalog }, null, 2),
      },
    ],
  }));

  server.resource("demo catalog", "rmg://catalog/demos", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            categories: getCategoryDescriptions(),
            demos: getDemoCatalog().map(serializeDemoMetadata),
          },
          null,
          2
        ),
      },
    ],
  }));

  server.resource("docs index", "rmg://docs", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({ docs: listPackageDocs() }, null, 2),
      },
    ],
  }));

  server.resource(
    "package doc",
    new ResourceTemplate("rmg://docs/{docId}", {
      list: async () => ({
        resources: listPackageDocResources(),
      }),
    }),
    async (uri, variables) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: readPackageDoc(String(variables.docId)),
        },
      ],
    })
  );

  server.resource("install guide", "rmg://docs/install", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: [
          "# React Motion Gallery Install",
          "",
          "```bash",
          "npm install react-motion-gallery",
          "```",
          "",
          'Import `react-motion-gallery/styles.css` once in the app shell or global client entry.',
          "",
          "Install optional video peers only when using `Video`:",
          "",
          "```bash",
          "npm install plyr plyr-react",
          "```",
          "",
          "Prefer subpath imports for narrow integrations, such as `react-motion-gallery/slider`, `react-motion-gallery/grid`, and `react-motion-gallery/masonry`.",
          "",
          "The package currently declares a PolyForm-Noncommercial license; revenue use requires the commercial license linked from package metadata.",
        ].join("\n"),
      },
    ],
  }));

  server.resource("skeleton text guide", "rmg://docs/skeleton-text", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: [
          "# Skeleton Text Authoring",
          "",
          "React Motion Gallery includes development-time browser measurement for text skeletons in any rendered DOM layout: sliders, grids, masonry, entries, thumbnails, flex layouts, app shells, cards, and custom UI.",
          "",
          "Use flat `targets` for ordinary DOM text. Add `slider`, `masonry`, or `entries` manifest metadata only when those specialized layouts need readiness or compensation behavior.",
          "",
          "Use `scaffold_skeleton_text` to create a manifest, then run:",
          "",
          "```bash",
          "npm run --silent generate:skeleton-text-module -- --input ./path/to/example.skeleton-text.browser.manifest.json --analysis-output ./path/to/example.measurements.json",
          "```",
          "",
          "The workflow opens a live page, measures real DOM text across viewports, and emits line counts, bar widths, optional text metrics, and optional responsive number exports such as slider row-height compensation.",
        ].join("\n"),
      },
    ],
  }));

  server.resource("layout selection guide", "rmg://guides/layout-selection", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: layoutSelectionGuide(),
      },
    ],
  }));

  server.resource("loading fidelity guide", "rmg://guides/loading-fidelity", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: loadingFidelityGuide(),
      },
    ],
  }));

  server.resource(
    "browser measured skeleton guide",
    "rmg://guides/browser-measured-skeletons",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: browserMeasuredSkeletonGuide(),
        },
      ],
    })
  );

  server.resource("skeleton cache guide", "rmg://guides/skeleton-cache", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: skeletonCacheGuide(),
      },
    ],
  }));

  server.resource(
    "demo example",
    new ResourceTemplate("rmg://examples/{demoId}", {
      list: async () => ({
        resources: getDemoCatalog().map((demo) => ({
          uri: `rmg://examples/${demo.id}`,
          name: demo.id,
          mimeType: "application/json",
          description: `${demo.eyebrow}: ${demo.title}`,
        })),
      }),
    }),
    async (uri, variables) => {
      const demoId = String(variables.demoId);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(getDemoCode(demoId), null, 2),
          },
        ],
      };
    }
  );
}

function registerTools(server: McpServer) {
  server.tool(
    "search_demos",
    "Filter React Motion Gallery demos by category, tags, component, media kind, or query.",
    {
      category: categorySchema.optional(),
      tags: z.array(z.string()).optional(),
      component: z.string().optional(),
      mediaKind: z.enum(["image", "video", "any"]).optional(),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
    async (args) => jsonContent({ demos: searchDemos(args) })
  );

  server.tool(
    "get_demo",
    "Return consumer-ready TSX/CSS for a specific React Motion Gallery demo.",
    {
      demoId: z.string(),
      includeExtraFiles: z.boolean().optional(),
    },
    async ({ demoId, includeExtraFiles }) => {
      const demo = getDemoCode(demoId);
      return jsonContent({
        ...demo,
        extraFiles: includeExtraFiles === false ? [] : demo.extraFiles,
      });
    }
  );

  server.tool(
    "recommend_pattern",
    "Map requirements to React Motion Gallery components, demos, imports, and gotchas.",
    {
      goal: z.string(),
      layout: categorySchema.or(z.literal("any")).optional(),
      features: z.array(z.string()).optional(),
      mediaKinds: z.array(z.enum(["image", "video", "node"])).optional(),
      framework: frameworkSchema.optional(),
      hasExistingLayout: z.boolean().optional(),
      limit: z.number().int().min(1).max(10).optional(),
    },
    async (args) => jsonContent(recommendPattern(args))
  );

  server.tool(
    "classify_gallery_workflow",
    "Classify a React Motion Gallery request by layout intent and loading fidelity.",
    {
      goal: z.string(),
      hasExistingLayout: z.boolean().optional(),
      layoutHint: layoutHintSchema.optional(),
      framework: frameworkSchema.optional(),
    },
    async (args) => jsonContent(classifyGalleryWorkflow(args))
  );

  server.tool(
    "generate_gallery_component",
    "Generate TSX/CSS from a selected demo or from a goal that can be matched to a demo.",
    {
      demoId: z.string().optional(),
      goal: z.string().optional(),
      componentName: z.string().regex(/^[A-Z][A-Za-z0-9_]*$/).optional(),
      cssModuleName: z.string().optional(),
    },
    async (args) => jsonContent(generateGalleryComponent(args))
  );

  server.tool(
    "write_gallery_files",
    "Write generated gallery files under a project root. Defaults to dry run unless apply is true.",
    {
      projectRoot: z.string(),
      componentPath: z.string(),
      cssPath: z.string().optional(),
      tsx: z.string().optional(),
      css: z.string().optional(),
      demoId: z.string().optional(),
      componentName: z.string().regex(/^[A-Z][A-Za-z0-9_]*$/).optional(),
      apply: z.boolean().optional(),
    },
    async (args) => {
      const generated =
        args.tsx !== undefined
          ? {
              files: {
                tsx: args.tsx,
                css: args.css ?? "",
                cssModuleName: args.cssPath ? cssModuleNameForComponent(args.cssPath) : undefined,
                extraFiles: [],
              },
              notes: [] as string[],
            }
          : generateGalleryComponent({
              demoId: args.demoId,
              componentName: args.componentName,
              cssModuleName: args.cssPath ? cssModuleNameForComponent(args.cssPath) : undefined,
            });

      const result = writeGalleryFiles({
        projectRoot: args.projectRoot,
        componentPath: args.componentPath,
        cssPath: args.cssPath,
        tsx: generated.files.tsx,
        css: args.css ?? generated.files.css,
        extraFiles: generated.files.extraFiles,
        apply: args.apply,
      });

      return jsonContent({
        ...result,
        notes: generated.notes,
      });
    }
  );

  server.tool(
    "audit_project",
    "Inspect a React app for React Motion Gallery install, stylesheet, peer dependency, and Next.js client-component issues.",
    {
      projectRoot: z.string(),
    },
    async ({ projectRoot }) => jsonContent(auditProject(projectRoot))
  );

  server.tool(
    "scaffold_skeleton_text",
    "Create a browser skeleton text manifest and regeneration commands for the existing RMG skeleton workflow.",
    {
      projectRoot: z.string(),
      manifestPath: z.string(),
      url: z.string(),
      outputFile: z.string(),
      moduleExportName: z.string(),
      chromePath: z.string().optional(),
      viewportMin: z.number().int().min(1).optional(),
      viewportMax: z.number().int().min(1).optional(),
      viewportHeight: z.number().int().min(1).optional(),
      viewportWorkers: z.number().int().min(1).optional(),
      settleMs: z.number().min(0).optional(),
      stableGeometryFrames: z.number().int().min(1).optional(),
      readyExpression: z.string().optional(),
      lineWrapGuardPx: z.number().min(0).optional(),
      lineMeasurementMethod: z.literal("domRange").optional(),
      responsiveBy: z.enum(["viewport", "container"]).optional(),
      breakpointStrategy: z.enum(["lineChanges", "lineOrBarChanges"]).optional(),
      barWidthUnit: z.enum(["px", "percent"]).optional(),
      includeTextMetrics: z.boolean().optional(),
      targets: z.array(skeletonTargetSchema).optional(),
      slider: skeletonSliderSchema.optional(),
      masonry: skeletonMasonrySchema.optional(),
      entries: skeletonEntriesSchema.optional(),
      apply: z.boolean().optional(),
    },
    async (args) => jsonContent(scaffoldSkeletonText(args))
  );
}

function registerPrompts(server: McpServer) {
  server.prompt(
    "build_layout_only",
    {
      appContext: z.string(),
      desiredExperience: z.string(),
      framework: frameworkSchema.optional(),
    },
    ({ appContext, desiredExperience, framework }) =>
      promptResponse([
        "Build a React Motion Gallery layout without skeleton loading.",
        "",
        `App context: ${appContext}`,
        `Desired experience: ${desiredExperience}`,
        `Framework: ${framework ?? "unknown"}`,
        "",
        "Classify this as layoutOnly. Choose the layout primitive, inspect relevant demos, import public package entry points, and do not add skeleton imports, manifests, or generated sidecars unless the user asks for loading UI.",
      ])
  );

  server.prompt(
    "build_layout_with_skeleton",
    {
      appContext: z.string(),
      desiredExperience: z.string(),
      skeletonFidelity: z.enum(["non-text", "hand-authored-text"]).optional(),
      framework: frameworkSchema.optional(),
    },
    ({ appContext, desiredExperience, skeletonFidelity, framework }) =>
      promptResponse([
        "Build a React Motion Gallery layout with skeleton loading.",
        "",
        `App context: ${appContext}`,
        `Desired experience: ${desiredExperience}`,
        `Skeleton fidelity: ${skeletonFidelity ?? "choose non-text unless text placeholders are requested"}`,
        `Framework: ${framework ?? "unknown"}`,
        "",
        "Use Skeleton rect/media/stack/row nodes or gallery-specific skeleton wrappers. If text placeholders are requested but browser measurement is not, hand-author lines/barWidth/lastBarWidth values. Do not create browser manifests or generated sidecars for this workflow.",
      ])
  );

  server.prompt(
    "build_layout_with_measured_text_skeleton",
    {
      appContext: z.string(),
      desiredExperience: z.string(),
      livePageUrl: z.string(),
      framework: frameworkSchema.optional(),
    },
    ({ appContext, desiredExperience, livePageUrl, framework }) =>
      promptResponse([
        "Build a React Motion Gallery layout with browser-measured skeleton text.",
        "",
        `App context: ${appContext}`,
        `Desired experience: ${desiredExperience}`,
        `Live page URL: ${livePageUrl}`,
        `Framework: ${framework ?? "unknown"}`,
        "",
        "Inspect real rendered text, add stable selectors, scaffold or update a browser manifest, run generate:skeleton-text-module with --analysis-output, import the generated sidecar values, and wire them into skeleton text nodes. Use flat targets by default; add slider, masonry, or entries manifest metadata only when that layout needs it.",
      ])
  );

  server.prompt(
    "retrofit_skeleton_loading",
    {
      currentCodeSummary: z.string(),
      desiredLoadingExperience: z.string(),
      framework: frameworkSchema.optional(),
    },
    ({ currentCodeSummary, desiredLoadingExperience, framework }) =>
      promptResponse([
        "Retrofit skeleton loading into an existing React Motion Gallery or custom layout.",
        "",
        `Current code summary: ${currentCodeSummary}`,
        `Desired loading experience: ${desiredLoadingExperience}`,
        `Framework: ${framework ?? "unknown"}`,
        "",
        "Preserve existing layout behavior. Choose non-text, hand-authored text, or browser-measured text fidelity based on the request. If browser-measured text is needed, add selectors, create/update the manifest, run the generator with --analysis-output, and import the generated sidecar values.",
      ])
  );

  server.prompt(
    "design_gallery_integration",
    {
      appContext: z.string(),
      desiredExperience: z.string(),
      framework: frameworkSchema.optional(),
    },
    ({ appContext, desiredExperience, framework }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Design a React Motion Gallery integration.",
              "",
              `App context: ${appContext}`,
              `Desired experience: ${desiredExperience}`,
              `Framework: ${framework ?? "unknown"}`,
              "",
              "Decide the best layout surface, whether GalleryCore/fullscreen is needed, which demos to inspect, what imports and CSS are required, and whether skeleton text measurement should be scaffolded.",
            ].join("\n"),
          },
        },
      ],
    })
  );

  server.prompt(
    "convert_existing_gallery_to_rmg",
    {
      currentCodeSummary: z.string(),
      migrationGoal: z.string(),
      framework: frameworkSchema.optional(),
    },
    ({ currentCodeSummary, migrationGoal, framework }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Migrate an existing gallery implementation to React Motion Gallery.",
              "",
              `Current code summary: ${currentCodeSummary}`,
              `Migration goal: ${migrationGoal}`,
              `Framework: ${framework ?? "unknown"}`,
              "",
              "Recommend the closest RMG component pattern, list required install/style changes, identify files to change, and preserve existing media data and visual behavior where practical.",
            ].join("\n"),
          },
        },
      ],
    })
  );
}

function promptResponse(lines: string[]) {
  return {
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: lines.join("\n"),
        },
      },
    ],
  };
}

export function isDemoCategoryId(value: string): value is DemoCategoryId {
  return categorySchema.safeParse(value).success;
}
