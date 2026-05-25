import type { DemoCategoryId, ProjectKind } from "./types.js";

export type GalleryWorkflowMode =
  | "layoutOnly"
  | "layoutWithNonTextSkeleton"
  | "layoutWithHandAuthoredTextSkeleton"
  | "layoutWithBrowserMeasuredTextSkeleton"
  | "skeletonRetrofit";

export type ClassifyGalleryWorkflowArgs = {
  goal: string;
  hasExistingLayout?: boolean;
  layoutHint?: DemoCategoryId | "app-shell" | "flex" | "custom" | "any";
  framework?: ProjectKind;
};

export function classifyGalleryWorkflow(args: ClassifyGalleryWorkflowArgs) {
  const goal = args.goal.trim();
  const text = `${goal} ${args.layoutHint ?? ""}`.toLowerCase();
  const mentionsLoading = hasAny(text, [
    "skeleton",
    "loading",
    "placeholder",
    "shimmer",
    "fallback",
    "pending",
  ]);
  const mentionsText = hasAny(text, [
    "text",
    "copy",
    "title",
    "body",
    "caption",
    "headline",
    "description",
    "label",
    "metadata",
    "content",
  ]);
  const mentionsMeasuredText = hasAny(text, [
    "browser",
    "measure",
    "measured",
    "analysis",
    "sidecar",
    "generated",
    "match real",
    "real content",
    "responsive copy",
    "exact",
    "fidelity",
  ]);
  const mentionsHandAuthored = hasAny(text, [
    "hand",
    "manual",
    "simple",
    "rough",
    "static",
    "no browser",
    "without browser",
    "no analysis",
    "without analysis",
  ]);
  const mentionsRetrofit = args.hasExistingLayout === true || hasAny(text, [
    "existing",
    "retrofit",
    "add skeleton",
    "improve skeleton",
    "update skeleton",
  ]);

  let mode: GalleryWorkflowMode = "layoutOnly";
  if (mentionsRetrofit && mentionsLoading) {
    mode = "skeletonRetrofit";
  } else if (mentionsLoading && mentionsText && mentionsMeasuredText) {
    mode = "layoutWithBrowserMeasuredTextSkeleton";
  } else if (mentionsLoading && mentionsText) {
    mode = mentionsHandAuthored || !mentionsMeasuredText
      ? "layoutWithHandAuthoredTextSkeleton"
      : "layoutWithBrowserMeasuredTextSkeleton";
  } else if (mentionsLoading) {
    mode = "layoutWithNonTextSkeleton";
  }

  const recommendedResources = resourcesForMode(mode);
  const recommendedTools = toolsForMode(mode);
  const nextSteps = nextStepsForMode(mode);
  const warnings = warningsForMode(mode, args.framework);

  return {
    goal,
    mode,
    layoutHint: args.layoutHint ?? "any",
    recommendedResources,
    recommendedTools,
    nextSteps,
    warnings,
  };
}

function resourcesForMode(mode: GalleryWorkflowMode) {
  const base = [
    "rmg://context/agent-brief",
    "rmg://guides/layout-selection",
    "rmg://catalog/demos",
  ];

  if (mode === "layoutOnly") return base;
  if (mode === "layoutWithBrowserMeasuredTextSkeleton") {
    return [
      ...base,
      "rmg://guides/loading-fidelity",
      "rmg://guides/browser-measured-skeletons",
      "rmg://guides/skeleton-cache",
      "rmg://docs/skeleton-text-authoring",
      "rmg://docs/skeleton-text-codex-prompt",
    ];
  }
  if (mode === "skeletonRetrofit") {
    return [
      ...base,
      "rmg://guides/loading-fidelity",
      "rmg://guides/browser-measured-skeletons",
      "rmg://guides/skeleton-cache",
      "rmg://docs/skeleton-text-codex-prompt",
    ];
  }

  return [...base, "rmg://guides/loading-fidelity", "rmg://guides/skeleton-cache"];
}

function toolsForMode(mode: GalleryWorkflowMode) {
  const base = ["recommend_pattern", "search_demos", "get_demo", "generate_gallery_component"];
  if (mode === "layoutWithBrowserMeasuredTextSkeleton" || mode === "skeletonRetrofit") {
    return [...base, "probe_render_context", "scaffold_skeleton_text", "audit_project"];
  }
  return base;
}

function nextStepsForMode(mode: GalleryWorkflowMode) {
  switch (mode) {
    case "layoutOnly":
      return [
        "Choose the layout primitive and demo with recommend_pattern or search_demos.",
        "Fetch the closest example with get_demo.",
        "Generate or hand-author the component and CSS without skeleton tooling.",
      ];
    case "layoutWithNonTextSkeleton":
      return [
        "Choose the layout primitive and loading surface.",
        "Use rect, media, stack, row, or gallery-specific skeleton wrappers.",
        "Skip browser text measurement and generated sidecars.",
      ];
    case "layoutWithHandAuthoredTextSkeleton":
      return [
        "Choose the layout primitive and skeleton wrapper.",
        "Hand-author text nodes with lines, barWidth, lastBarWidth, barHeight, and lineHeight.",
        "Skip browser text measurement unless the user asks for matching responsive copy.",
      ];
    case "layoutWithBrowserMeasuredTextSkeleton":
      return [
        "Add stable selectors to the real rendered text.",
        "Use flat targets by default; add slider, masonry, or entries metadata only when that layout needs it.",
        "Dry-run scaffold_skeleton_text to get the exact probe_render_context call, then probe the live page and pass renderReceiptId when applying.",
        "Run generate:skeleton-text-module with --analysis-output, then import the generated sidecar values.",
        "For SSR reload performance, wire the skeleton cookie snapshot cache with a stable cache key and route key.",
      ];
    case "skeletonRetrofit":
      return [
        "Inspect the existing layout and current loading behavior before changing code.",
        "Choose non-text, hand-authored text, or browser-measured text fidelity based on the user goal.",
        "Preserve existing layout behavior and add the smallest skeleton layer that satisfies the request.",
        "For browser-measured text, apply scaffolds only after probe_render_context returns a fresh matching renderReceiptId.",
        "If the skeleton has responsive text or expensive geometry CSS, add the cookie snapshot cache instead of client-only storage.",
      ];
  }
}

function warningsForMode(mode: GalleryWorkflowMode, framework: ProjectKind | undefined) {
  const warnings: string[] = [];
  if (framework === "next") {
    warnings.push('Interactive gallery components should live in a "use client" component.');
  }
  if (mode === "layoutWithBrowserMeasuredTextSkeleton" || mode === "skeletonRetrofit") {
    warnings.push("Browser-measured text needs a live page URL, stable selectors, and a fresh probe_render_context receipt before apply.");
  }
  return warnings;
}

function hasAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}
