import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  componentCatalog,
  getCategoryDescriptions,
  getDemoById,
  getDemoCatalog,
  serializeDemoMetadata,
} from "./catalog.js";
import { jsonContent } from "./content.js";
import { cssModuleNameForComponent, generateGalleryComponent } from "./generate.js";
import { auditProject, writeGalleryFiles } from "./project.js";
import { recommendPattern, searchDemos } from "./recommend.js";
import { scaffoldSkeletonText } from "./skeleton.js";
import { getDemoCode } from "./snippets.js";
import type { DemoCategoryId } from "./types.js";

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
          "React Motion Gallery includes development-time browser measurement for text skeletons.",
          "",
          "Use `scaffold_skeleton_text` to create a manifest, then run:",
          "",
          "```bash",
          "npm run --silent generate:skeleton-text-module -- --input ./path/to/example.skeleton-text.browser.manifest.json",
          "```",
          "",
          "The workflow opens a live page, measures real DOM text across viewports, and emits line counts, bar widths, and optional text metrics for stable skeleton layouts.",
        ].join("\n"),
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
      limit: z.number().int().min(1).max(10).optional(),
    },
    async (args) => jsonContent(recommendPattern(args))
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
      viewportMin: z.number().int().min(1).optional(),
      viewportMax: z.number().int().min(1).optional(),
      viewportHeight: z.number().int().min(1).optional(),
      responsiveBy: z.enum(["viewport", "container"]).optional(),
      breakpointStrategy: z.enum(["lineChanges", "lineOrBarChanges"]).optional(),
      barWidthUnit: z.enum(["px", "percent"]).optional(),
      includeTextMetrics: z.boolean().optional(),
      targets: z.array(
        z.object({
          exportName: z.string(),
          selector: z.string(),
          widthMode: z.enum(["barWidth", "lastBarWidth", "both"]).optional(),
          barHeight: z.number().optional(),
          lineHeight: z.number().optional(),
        })
      ),
      apply: z.boolean().optional(),
    },
    async (args) => jsonContent(scaffoldSkeletonText(args))
  );
}

function registerPrompts(server: McpServer) {
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

export function isDemoCategoryId(value: string): value is DemoCategoryId {
  return categorySchema.safeParse(value).success;
}
