import fs from "node:fs";
import path from "node:path";

import { repoPath, toPosixPath } from "./paths.js";

export type PackageDoc = {
  id: string;
  title: string;
  uri: string;
  path: string;
  whenToRead: string;
};

const packageDocs: PackageDoc[] = [
  {
    id: "readme",
    title: "React Motion Gallery README",
    uri: "rmg://docs/readme",
    path: repoPath("packages", "react-motion-gallery", "README.md"),
    whenToRead: "Use for package overview, entry points, API reference, and MCP setup examples.",
  },
  {
    id: "skeleton-text-authoring",
    title: "Skeleton Text Authoring",
    uri: "rmg://docs/skeleton-text-authoring",
    path: repoPath("packages", "react-motion-gallery", "docs", "skeleton-text-authoring.md"),
    whenToRead: "Use for the browser-based measured skeleton text manifest and generator workflow.",
  },
  {
    id: "skeleton-text-codex-prompt",
    title: "Skeleton Text AI Agent Prompt",
    uri: "rmg://docs/skeleton-text-codex-prompt",
    path: repoPath("packages", "react-motion-gallery", "docs", "skeleton-text-codex-prompt.md"),
    whenToRead: "Use when instructing an AI agent to add or update measured skeleton text.",
  },
  {
    id: "license",
    title: "License",
    uri: "rmg://docs/license",
    path: repoPath("packages", "react-motion-gallery", "LICENSE.md"),
    whenToRead: "Use for package license terms.",
  },
  {
    id: "third-party-notices",
    title: "Third Party Notices",
    uri: "rmg://docs/third-party-notices",
    path: repoPath("packages", "react-motion-gallery", "THIRD_PARTY_NOTICES.md"),
    whenToRead: "Use for bundled third-party license notices.",
  },
];

export function listPackageDocs() {
  return packageDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    uri: doc.uri,
    path: toPosixPath(path.relative(repoPath(), doc.path)),
    whenToRead: doc.whenToRead,
  }));
}

export function listPackageDocResources() {
  return packageDocs.map((doc) => ({
    uri: doc.uri,
    name: doc.title,
    mimeType: "text/markdown",
    description: doc.whenToRead,
  }));
}

export function readPackageDoc(docId: string) {
  const doc = packageDocs.find((candidate) => candidate.id === docId);
  if (!doc) {
    throw new Error(`Unknown React Motion Gallery doc: ${docId}`);
  }
  return fs.readFileSync(doc.path, "utf8");
}

export function agentBriefGuide() {
  return [
    "# React Motion Gallery MCP Agent Brief",
    "",
    "Start by classifying the user's request as layout intent plus loading fidelity.",
    "",
    "1. Call `classify_gallery_workflow` with the user's goal.",
    "2. Read the recommended guide resources returned by the classifier.",
    "3. Use `recommend_pattern`, `search_demos`, and `get_demo` to choose examples.",
    "4. Only use `scaffold_skeleton_text` when the workflow calls for browser-measured skeleton text.",
    "5. For file writing, keep dry-run output until generated files have been reviewed; pass `apply: true` only when writing is intended.",
    "",
    "Browser-measured skeleton text applies to any real rendered DOM text: sliders, grids, masonry, entries, thumbnails, flex layouts, app shells, cards, and custom UI. Use flat `targets` by default. Add specialized `slider`, `masonry`, or `entries` manifest metadata only when those layout modes need readiness or compensation behavior.",
  ].join("\n");
}

export function layoutSelectionGuide() {
  return [
    "# React Motion Gallery Layout Selection",
    "",
    "- Use `Slider` for one active position, carousel navigation, grouped cells, loop, wheel, thumbnails, and slide plugins.",
    "- Use `Grid` for predictable responsive tracks, product/editorial grids, spans, and template columns.",
    "- Use `Masonry` for uneven cards or mixed aspect ratios where balanced or source-order placement matters.",
    "- Use `Entries` when the content model is rows of text, metadata, and coordinated media.",
    "- Use `ThumbnailSlider` or `FullscreenThumbnailSlider` when navigation should be visual.",
    "- Use `GalleryCore` and `useFullscreenController` when media should expand into fullscreen.",
    "- Use `ZoomPanImage` for inspectable cropped images without a fullscreen overlay.",
    "- Use standalone `Skeleton` for app shells, flex layouts, custom cards, and non-gallery loading UI.",
    "",
    "For custom layouts, keep the real markup ergonomic first, then choose skeleton fidelity separately. Skeleton text measurement does not require a gallery primitive; it only needs stable selectors on rendered DOM text and a live page URL.",
  ].join("\n");
}

export function loadingFidelityGuide() {
  return [
    "# React Motion Gallery Loading Fidelity",
    "",
    "Think of each request as layout intent plus loading fidelity.",
    "",
    "```text",
    "User goal: \"Build a responsive gallery slider.\"",
    "Workflow: layoutOnly",
    "Use: recommend_pattern -> get_demo -> generate_gallery_component",
    "Skip: skeleton tools",
    "```",
    "",
    "```text",
    "User goal: \"Build a product grid with image placeholders while loading.\"",
    "Workflow: layoutWithNonTextSkeleton",
    "Use: Skeleton rect/media nodes or gallery skeleton wrappers",
    "Skip: browser text measurement",
    "```",
    "",
    "```text",
    "User goal: \"Build a card layout with simple text skeleton lines.\"",
    "Workflow: layoutWithHandAuthoredTextSkeleton",
    "Use: text skeleton nodes with hand-authored lines/barWidth values",
    "Skip: generated sidecar",
    "```",
    "",
    "```text",
    "User goal: \"Build a masonry layout where skeleton text matches real responsive copy.\"",
    "Workflow: layoutWithBrowserMeasuredTextSkeleton",
    "Use: stable selectors -> scaffold_skeleton_text -> generate:skeleton-text-module --analysis-output -> import sidecar",
    "```",
    "",
    "If the user has an existing layout and asks to add or improve skeletons, classify it as `skeletonRetrofit` and preserve existing rendering behavior while choosing the smallest skeleton layer that meets the requested fidelity.",
  ].join("\n");
}

export function browserMeasuredSkeletonGuide() {
  return [
    "# Browser-Measured Skeleton Text",
    "",
    "Use browser-measured skeleton text only when the user wants skeleton text to match real rendered content across responsive widths. This is optional; simple skeletons can be hand-authored.",
    "",
    "The workflow applies to any rendered DOM text: slider cards, grids, masonry cards, entries rows, thumbnails, app shells, flex layouts, pricing cards, and custom UI.",
    "",
    "Default workflow:",
    "",
    "1. Add stable selectors to the real rendered text, such as `data-skeleton-text-id`.",
    "2. Create or update a browser manifest with flat `targets`.",
    "3. Run `npm run --silent generate:skeleton-text-module -- --input ./path/to/manifest.json --analysis-output ./path/to/measurements.json`.",
    "4. Import the generated sidecar exports into the component.",
    "5. Wire generated values into skeleton `text` nodes.",
    "",
    "Manifest modes:",
    "",
    "- Use flat `targets` for ordinary DOM text in any layout.",
    "- Add `slider` mode for equal-height card sliders that need canonical item measurement and row-height compensation.",
    "- Add `masonry` readiness metadata when text is inside positioned masonry items and geometry needs to settle before sampling.",
    "- Add `entries` readiness metadata when measuring `Entries` rows that expose mount/ready attributes.",
    "- Use `readyExpression`, `settleMs`, and `stableGeometryFrames` for custom client-measured layouts.",
    "",
    "Example flat-target manifest call:",
    "",
    "```json",
    "{",
    "  \"projectRoot\": \"/absolute/path/to/app\",",
    "  \"manifestPath\": \"src/components/pricing.skeleton-text.browser.manifest.json\",",
    "  \"url\": \"http://127.0.0.1:3000/pricing?skeletonMeasure=content\",",
    "  \"outputFile\": \"src/components/pricing.skeleton-text.generated.ts\",",
    "  \"moduleExportName\": \"pricingSkeletonText\",",
    "  \"barWidthUnit\": \"px\",",
    "  \"includeTextMetrics\": true,",
    "  \"targets\": [",
    "    {",
    "      \"exportName\": \"pricingCardTitle\",",
    "      \"selector\": \"[data-skeleton-text-id='pricingCardTitle']\"",
    "    }",
    "  ],",
    "  \"apply\": true",
    "}",
    "```",
  ].join("\n");
}
