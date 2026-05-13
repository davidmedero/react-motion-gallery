import { componentCatalog, getDemoCatalog, serializeDemoMetadata } from "./catalog.js";
import type { DemoCategoryId, DemoMetadata } from "./types.js";
import { classifyGalleryWorkflow } from "./workflow.js";

export type RecommendPatternArgs = {
  goal: string;
  layout?: DemoCategoryId | "any";
  features?: string[];
  mediaKinds?: Array<"image" | "video" | "node">;
  framework?: "next" | "vite" | "react" | "unknown";
  hasExistingLayout?: boolean;
  limit?: number;
};

export function recommendPattern(args: RecommendPatternArgs) {
  const goal = args.goal.trim();
  const searchText = [
    goal,
    args.layout ?? "",
    ...(args.features ?? []),
    ...(args.mediaKinds ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const requestedFeatures = new Set(
    [...tokens(searchText), ...(args.features ?? []).map((feature) => feature.toLowerCase())]
  );

  const components = scoreComponents(searchText, args.layout).slice(0, 5);
  const demos = scoreDemos(searchText, requestedFeatures, args.layout).slice(0, args.limit ?? 5);
  const install = buildInstallAdvice(searchText, args.mediaKinds ?? []);
  const gotchas = buildGotchas(searchText, args.framework);
  const workflow = classifyGalleryWorkflow({
    goal,
    hasExistingLayout: args.hasExistingLayout,
    layoutHint: args.layout,
    framework: args.framework,
  });

  return {
    goal,
    workflow,
    recommendedComponents: components.map(({ component, score }) => ({
      ...component,
      score,
    })),
    recommendedDemos: demos.map(({ demo, score }) => ({
      ...serializeDemoMetadata(demo),
      score,
    })),
    install,
    gotchas,
    nextSteps: [
      `Workflow mode: ${workflow.mode}.`,
      ...workflow.nextSteps,
      "Call get_demo with the best demoId to inspect production-ready TSX and CSS.",
      "Call generate_gallery_component to rename the example for your app.",
      "Call write_gallery_files with apply: true only after reviewing the generated files.",
    ],
  };
}

export function searchDemos(args: {
  category?: DemoCategoryId;
  tags?: string[];
  component?: string;
  mediaKind?: "image" | "video" | "any";
  query?: string;
  limit?: number;
}) {
  const tags = new Set((args.tags ?? []).map((tag) => tag.toLowerCase()));
  const query = args.query?.toLowerCase().trim() ?? "";
  const component = args.component?.toLowerCase().trim() ?? "";
  const mediaKind = args.mediaKind ?? "any";

  const demos = getDemoCatalog()
    .map((demo) => ({ demo, score: scoreDemoForSearch(demo, { tags, query, component, mediaKind }) }))
    .filter(({ demo, score }) => {
      if (args.category && demo.categoryId !== args.category) {
        return false;
      }
      return score > 0 || (!query && tags.size === 0 && !component && mediaKind === "any");
    })
    .sort((a, b) => b.score - a.score || a.demo.id.localeCompare(b.demo.id))
    .slice(0, args.limit ?? 20);

  return demos.map(({ demo, score }) => ({
    ...serializeDemoMetadata(demo),
    score,
  }));
}

function scoreComponents(searchText: string, layout?: DemoCategoryId | "any") {
  return componentCatalog
    .map((component) => {
      let score = 0;
      const haystack = [
        component.id,
        component.name,
        component.description,
        component.importPath,
        ...component.exports,
        ...component.whenToUse,
        ...component.relatedTags,
      ]
        .join(" ")
        .toLowerCase();

      for (const token of tokens(searchText)) {
        if (haystack.includes(token)) score += 2;
        if (component.relatedTags.includes(token)) score += 3;
      }

      if (layout && layout !== "any" && component.categoryIds.includes(layout)) {
        score += 6;
      }

      return { component, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.component.id.localeCompare(b.component.id));
}

function scoreDemos(
  searchText: string,
  requestedFeatures: Set<string>,
  layout?: DemoCategoryId | "any"
) {
  return getDemoCatalog()
    .map((demo) => {
      let score = 0;
      const haystack = [demo.id, demo.title, demo.eyebrow, demo.categoryId, ...demo.tags]
        .join(" ")
        .toLowerCase();

      for (const token of tokens(searchText)) {
        if (haystack.includes(token)) score += 2;
      }

      for (const tag of demo.tags) {
        if (requestedFeatures.has(tag.toLowerCase())) score += 4;
      }

      if (layout && layout !== "any" && demo.categoryId === layout) {
        score += 8;
      }

      if (searchText.includes("video") && demo.tags.some((tag) => /video|html5|youtube|vimeo/i.test(tag))) {
        score += 6;
      }
      if (searchText.includes("thumbnail") && demo.tags.includes("thumbnails")) score += 6;
      if (searchText.includes("fullscreen") && demo.tags.includes("fullscreen")) score += 5;
      if (searchText.includes("skeleton") && demo.tags.includes("skeleton")) score += 5;

      return { demo, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.demo.id.localeCompare(b.demo.id));
}

function scoreDemoForSearch(
  demo: DemoMetadata,
  args: {
    tags: Set<string>;
    query: string;
    component: string;
    mediaKind: "image" | "video" | "any";
  }
) {
  let score = 1;
  const haystack = [demo.id, demo.title, demo.eyebrow, demo.categoryId, ...demo.tags]
    .join(" ")
    .toLowerCase();

  if (args.query) {
    score = haystack.includes(args.query) ? score + 8 : 0;
    for (const token of tokens(args.query)) {
      if (haystack.includes(token)) score += 2;
    }
  }

  for (const tag of args.tags) {
    if (demo.tags.map((demoTag) => demoTag.toLowerCase()).includes(tag)) {
      score += 6;
    } else {
      score = 0;
    }
  }

  if (args.component && !haystack.includes(args.component)) {
    score = 0;
  } else if (args.component) {
    score += 5;
  }

  if (args.mediaKind === "video") {
    score += /video|html5|youtube|vimeo/.test(haystack) ? 8 : -5;
  }

  return score;
}

function buildInstallAdvice(searchText: string, mediaKinds: string[]) {
  const needsVideoPeers =
    searchText.includes("video") ||
    mediaKinds.includes("video") ||
    searchText.includes("youtube") ||
    searchText.includes("vimeo");

  return {
    package: "npm install react-motion-gallery",
    stylesheet: 'import "react-motion-gallery/styles.css";',
    optionalVideoPeers: needsVideoPeers ? "npm install plyr plyr-react" : null,
    license:
      "The package currently declares PolyForm-Noncommercial; revenue use requires the commercial license linked from the package metadata.",
  };
}

function buildGotchas(searchText: string, framework: string | undefined) {
  const gotchas = [
    "Use public package imports, not repo-local demo imports.",
    "Prefer subpath imports for narrow integrations; use the root import when a component needs several gallery surfaces.",
  ];

  if (framework === "next") {
    gotchas.push('Interactive gallery components should live in a "use client" component.');
  }

  if (searchText.includes("fullscreen")) {
    gotchas.push("Fullscreen integrations need GalleryCore plus useFullscreenController.");
  }

  if (searchText.includes("skeleton")) {
    gotchas.push("Browser-measured skeleton text sidecars should be regenerated when copy or layout changes.");
  }

  return gotchas;
}

function tokens(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 3);
}
