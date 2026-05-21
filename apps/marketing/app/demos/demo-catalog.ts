export type DemoCategoryId =
  | "slider"
  | "grid"
  | "masonry"
  | "entries"
  | "zoom-pan"
  | "fullscreen"
  | "skeleton"
  | "reveal";

export type DemoNavItem =
  | {
      type: "demo";
      demoId: DemoId;
    }
  | {
      type: "group";
      id: string;
      label: string;
      demoIds: DemoId[];
    };

export type DemoCategory = {
  id: DemoCategoryId;
  label: string;
  description: string;
  items: DemoNavItem[];
};

export type DemoMetadata = {
  id: string;
  title: string;
  eyebrow: string;
  tags: readonly string[];
  categoryId: DemoCategoryId;
};

export const DEMO_METADATA = [
  { id: "slider-default", title: "Default", eyebrow: "Slider", tags: ["fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-loop", title: "Loop", eyebrow: "Slider", tags: ["center", "initialIndex", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-video-html5", title: "HTML5", eyebrow: "Slider Video", tags: ["fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-video-html5-loop", title: "HTML5 + Loop", eyebrow: "Slider Video", tags: ["center", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-video-youtube", title: "Youtube", eyebrow: "Slider Video", tags: ["scroll-bar", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-video-youtube-loop", title: "Youtube + Loop", eyebrow: "Slider Video", tags: ["scroll-bar", "center", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-video-vimeo", title: "Vimeo", eyebrow: "Slider Video", tags: ["scroll-bar", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-video-vimeo-loop", title: "Vimeo + Loop", eyebrow: "Slider Video", tags: ["scroll-bar", "center", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-right-to-left", title: "Right To Left", eyebrow: "Slider", tags: ["fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-group-cells", title: "Group Cells", eyebrow: "Slider", tags: ["fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-free-scroll", title: "Free Scroll", eyebrow: "Slider", tags: ["group-cells", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-skip-snaps", title: "Skip Snaps", eyebrow: "Slider", tags: ["fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-strict-snaps", title: "Strict Snaps", eyebrow: "Slider", tags: ["loop", "align-center", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-center-align", title: "Center Align", eyebrow: "Slider", tags: ["fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-variable-widths", title: "Variable Widths", eyebrow: "Slider", tags: ["center", "contain-scroll", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-y-axis", title: "Y Axis", eyebrow: "Slider", tags: ["fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-cells-per-slide", title: "Cells Per Slide", eyebrow: "Slider", tags: ["group-cells", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-thumbnails", title: "Thumbnails", eyebrow: "Slider", tags: ["fullscreen", "skeleton", "fullscreen-thumbnails"], categoryId: "slider" },
  { id: "slider-lazy-load", title: "Lazy Load", eyebrow: "Slider", tags: ["fullscreen", "skeleton", "fullscreen-lazy-load"], categoryId: "slider" },
  { id: "slider-auto-scroll", title: "Auto Scroll", eyebrow: "Slider", tags: ["progress", "center", "loop", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-auto-play", title: "Auto Play", eyebrow: "Slider", tags: ["center", "loop", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-auto-height", title: "Auto Height", eyebrow: "Slider", tags: ["center", "loop", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-parallax", title: "Parallax", eyebrow: "Slider", tags: ["free-scroll", "center", "loop", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-scale", title: "Scale", eyebrow: "Slider", tags: ["center", "loop", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-fade", title: "Fade", eyebrow: "Slider", tags: ["center", "loop", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-crossfade", title: "Crossfade", eyebrow: "Slider", tags: ["center", "loop", "drag", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-cards", title: "Cards", eyebrow: "Slider", tags: ["cells-per-slide", "group-cells", "loop", "fullscreen", "skeleton"], categoryId: "slider" },
  { id: "slider-interactive", title: "Interactive", eyebrow: "Slider API", tags: ["gallery-api", "append", "prepend", "insert", "remove", "replace", "set-items"], categoryId: "slider" },
  { id: "grid-columns", title: "Spans", eyebrow: "Grid", tags: ["fullscreen", "responsive", "skeleton", "span", "grid.item"], categoryId: "grid" },
  { id: "grid-template-columns", title: "Template Columns", eyebrow: "Grid", tags: ["fullscreen", "skeleton", "template-columns", "span"], categoryId: "grid" },
  { id: "grid-min-column-width", title: "Min Column Width", eyebrow: "Grid", tags: ["fullscreen", "skeleton"], categoryId: "grid" },
  { id: "grid-lazy-load", title: "Lazy Load", eyebrow: "Grid", tags: ["fullscreen", "skeleton", "fullscreen-lazy-load"], categoryId: "grid" },
  { id: "grid-video-html5", title: "HTML5", eyebrow: "Grid Video", tags: ["fullscreen", "skeleton"], categoryId: "grid" },
  { id: "grid-video-youtube", title: "Youtube", eyebrow: "Grid Video", tags: ["fullscreen", "skeleton"], categoryId: "grid" },
  { id: "grid-video-vimeo", title: "Vimeo", eyebrow: "Grid Video", tags: ["fullscreen", "skeleton"], categoryId: "grid" },
  { id: "masonry-balanced", title: "Balanced", eyebrow: "Masonry", tags: ["balanced", "video", "fullscreen", "skeleton", "text", "itemWrapStyle"], categoryId: "masonry" },
  { id: "masonry-spans", title: "Spans", eyebrow: "Masonry", tags: ["balanced", "span", "video", "fullscreen", "skeleton", "masonry.item"], categoryId: "masonry" },
  { id: "masonry-horizontal-order", title: "Horizontal Order", eyebrow: "Masonry", tags: ["horizontal-order", "span", "video", "fullscreen", "skeleton"], categoryId: "masonry" },
  { id: "masonry-round-robin", title: "Round Robin", eyebrow: "Masonry", tags: ["round-robin", "video", "fullscreen", "skeleton"], categoryId: "masonry" },
  { id: "masonry-lazy-load", title: "Lazy Load", eyebrow: "Masonry", tags: ["video", "fullscreen", "skeleton", "fullscreen-lazy-load"], categoryId: "masonry" },
  { id: "masonry-video-html5", title: "HTML5", eyebrow: "Masonry Video", tags: ["html5", "video", "fullscreen", "skeleton"], categoryId: "masonry" },
  { id: "masonry-video-youtube", title: "Youtube", eyebrow: "Masonry Video", tags: ["youtube", "video", "fullscreen", "skeleton"], categoryId: "masonry" },
  { id: "masonry-video-vimeo", title: "Vimeo", eyebrow: "Masonry Video", tags: ["vimeo", "video", "fullscreen", "skeleton"], categoryId: "masonry" },
  { id: "entries-slider", title: "Slider", eyebrow: "Entries", tags: ["slider", "fullscreen"], categoryId: "entries" },
  { id: "entries-slider-html5", title: "Slider + HTML5", eyebrow: "Entries", tags: ["slider", "html5", "video", "fullscreen"], categoryId: "entries" },
  { id: "entries-grid", title: "Grid", eyebrow: "Entries", tags: ["grid", "fullscreen"], categoryId: "entries" },
  { id: "entries-masonry", title: "Masonry", eyebrow: "Entries", tags: ["masonry", "fullscreen"], categoryId: "entries" },
  { id: "fullscreen-layout-agnostic", title: "Standalone", eyebrow: "Fullscreen", tags: ["openFullscreenAt", "api", "scale", "custom-markup"], categoryId: "fullscreen" },
  { id: "fullscreen-slide-bound-caption", title: "Slide Caption", eyebrow: "Fullscreen", tags: ["captions", "slide", "responsive"], categoryId: "fullscreen" },
  { id: "fullscreen-thumbnails", title: "Thumbnails", eyebrow: "Fullscreen", tags: ["thumbnails", "navigation", "sync"], categoryId: "fullscreen" },
  { id: "fullscreen-caption-thumbnails", title: "Caption + Thumbnails", eyebrow: "Fullscreen", tags: ["captions", "overlay", "thumbnails", "responsive"], categoryId: "fullscreen" },
  { id: "fullscreen-fade-effects", title: "Fade Effects", eyebrow: "Fullscreen", tags: ["intro-fade", "slide-fade", "thumbnails"], categoryId: "fullscreen" },
  { id: "fullscreen-viewport-overlay-caption", title: "Overlay Caption", eyebrow: "Fullscreen", tags: ["overlay", "captions", "viewport"], categoryId: "fullscreen" },
  { id: "fullscreen-viewport-overlay-caption-sized", title: "Overlay Caption (Sized)", eyebrow: "Fullscreen", tags: ["overlay", "captions", "responsive"], categoryId: "fullscreen" },
  { id: "fullscreen-lazy-load", title: "Lazy Load", eyebrow: "Fullscreen", tags: ["lazy-load", "media"], categoryId: "fullscreen" },
  { id: "skeleton-flex-cards", title: "Flex Cards", eyebrow: "Skeleton", tags: ["standalone", "flex", "text", "responsive"], categoryId: "skeleton" },
  { id: "skeleton-app-shell", title: "App Shell", eyebrow: "Skeleton", tags: ["standalone", "flex", "dashboard", "nested"], categoryId: "skeleton" },
  { id: "skeleton-responsive-text", title: "Responsive Text", eyebrow: "Skeleton", tags: ["standalone", "text", "container-query", "responsive"], categoryId: "skeleton" },
  { id: "skeleton-force-overlay", title: "Force Overlay", eyebrow: "Skeleton", tags: ["standalone", "force", "compare", "opacity"], categoryId: "skeleton" },
  { id: "reveal-sections", title: "Sections", eyebrow: "Reveal", tags: ["standalone", "fade", "transform", "stagger"], categoryId: "reveal" },
  { id: "zoom-pan-standalone", title: "Standalone", eyebrow: "Zoom + Pan", tags: ["zoom-pan", "image", "standalone", "crop"], categoryId: "zoom-pan" },
  { id: "zoom-pan-slider", title: "Slider", eyebrow: "Zoom + Pan", tags: ["zoom-pan", "slider", "images"], categoryId: "zoom-pan" },
  { id: "zoom-pan-grid", title: "Grid", eyebrow: "Zoom + Pan", tags: ["zoom-pan", "grid", "images"], categoryId: "zoom-pan" },
  { id: "zoom-pan-masonry", title: "Masonry", eyebrow: "Zoom + Pan", tags: ["zoom-pan", "masonry", "images"], categoryId: "zoom-pan" },
] as const satisfies readonly DemoMetadata[];

export type DemoId = (typeof DEMO_METADATA)[number]["id"];
export type DemoCatalogEntry = (typeof DEMO_METADATA)[number];

export const DEFAULT_DEMO_ID = DEMO_METADATA[0].id;

export const DEMO_CATEGORIES = [
  {
    id: "slider",
    label: "Slider",
    description:
      "A motion-first slider primitive where drag, wheel, and fullscreen handoffs feel continuous.",
    items: [
      { type: "demo", demoId: "slider-default" },
      { type: "demo", demoId: "slider-loop" },
      {
        type: "group",
        id: "slider-video",
        label: "Video",
        demoIds: [
          "slider-video-html5",
          "slider-video-html5-loop",
          "slider-video-youtube",
          "slider-video-youtube-loop",
          "slider-video-vimeo",
          "slider-video-vimeo-loop",
        ],
      },
      { type: "demo", demoId: "slider-right-to-left" },
      { type: "demo", demoId: "slider-group-cells" },
      { type: "demo", demoId: "slider-free-scroll" },
      { type: "demo", demoId: "slider-skip-snaps" },
      { type: "demo", demoId: "slider-strict-snaps" },
      { type: "demo", demoId: "slider-center-align" },
      { type: "demo", demoId: "slider-variable-widths" },
      { type: "demo", demoId: "slider-y-axis" },
      { type: "demo", demoId: "slider-cells-per-slide" },
      { type: "demo", demoId: "slider-thumbnails" },
      { type: "demo", demoId: "slider-lazy-load" },
      { type: "demo", demoId: "slider-auto-scroll" },
      { type: "demo", demoId: "slider-auto-play" },
      { type: "demo", demoId: "slider-auto-height" },
      { type: "demo", demoId: "slider-parallax" },
      { type: "demo", demoId: "slider-scale" },
      { type: "demo", demoId: "slider-fade" },
      { type: "demo", demoId: "slider-crossfade" },
      { type: "demo", demoId: "slider-cards" },
      { type: "demo", demoId: "slider-interactive" },
    ],
  },
  {
    id: "grid",
    label: "Grid",
    description:
      "Predictable media grids with responsive spans and fullscreen handoffs built into the layout.",
    items: [
      { type: "demo", demoId: "grid-columns" },
      { type: "demo", demoId: "grid-template-columns" },
      { type: "demo", demoId: "grid-min-column-width" },
      { type: "demo", demoId: "grid-lazy-load" },
      {
        type: "group",
        id: "grid-video",
        label: "Video",
        demoIds: ["grid-video-html5", "grid-video-youtube", "grid-video-vimeo"],
      },
    ],
  },
  {
    id: "masonry",
    label: "Masonry",
    description:
      "Server-predicted masonry layouts that keep height and placement stable through hydration, then refine with live measurements.",
    items: [
      { type: "demo", demoId: "masonry-balanced" },
      { type: "demo", demoId: "masonry-spans" },
      { type: "demo", demoId: "masonry-horizontal-order" },
      { type: "demo", demoId: "masonry-round-robin" },
      { type: "demo", demoId: "masonry-lazy-load" },
      {
        type: "group",
        id: "masonry-video",
        label: "Video",
        demoIds: [
          "masonry-video-html5",
          "masonry-video-youtube",
          "masonry-video-vimeo",
        ],
      },
    ],
  },
  {
    id: "entries",
    label: "Entries",
    description:
      "Structured editorial rows whose text, metadata, and media blocks can render as sliders, grids, or masonry galleries.",
    items: [
      { type: "demo", demoId: "entries-slider" },
      { type: "demo", demoId: "entries-slider-html5" },
      { type: "demo", demoId: "entries-grid" },
      { type: "demo", demoId: "entries-masonry" },
    ],
  },
  {
    id: "zoom-pan",
    label: "Zoom + Pan",
    description:
      "Standalone zoomable image primitives for cropped cards, heroes, and editorial media without any fullscreen controller.",
    items: [
      { type: "demo", demoId: "zoom-pan-standalone" },
      { type: "demo", demoId: "zoom-pan-slider" },
      { type: "demo", demoId: "zoom-pan-grid" },
      { type: "demo", demoId: "zoom-pan-masonry" },
    ],
  },
  {
    id: "fullscreen",
    label: "Fullscreen",
    description:
      "Fullscreen controller demos for standalone triggers, slide-bound captions, viewport overlays, thumbnail rails, and lazy media loading.",
    items: [
      { type: "demo", demoId: "fullscreen-layout-agnostic" },
      { type: "demo", demoId: "fullscreen-slide-bound-caption" },
      { type: "demo", demoId: "fullscreen-viewport-overlay-caption" },
      { type: "demo", demoId: "fullscreen-viewport-overlay-caption-sized" },
      { type: "demo", demoId: "fullscreen-thumbnails" },
      { type: "demo", demoId: "fullscreen-caption-thumbnails" },
      { type: "demo", demoId: "fullscreen-fade-effects" },
      { type: "demo", demoId: "fullscreen-lazy-load" },
    ],
  },
  {
    id: "skeleton",
    label: "Skeleton",
    description:
      "Standalone skeleton primitives for real readiness, app shells, responsive media, and forced compare overlays without importing a gallery layout.",
    items: [
      { type: "demo", demoId: "skeleton-flex-cards" },
      { type: "demo", demoId: "skeleton-app-shell" },
      { type: "demo", demoId: "skeleton-responsive-text" },
      { type: "demo", demoId: "skeleton-force-overlay" },
    ],
  },
  {
    id: "reveal",
    label: "Reveal",
    description:
      "Standalone section reveals for app and marketing UI without implying loading state.",
    items: [{ type: "demo", demoId: "reveal-sections" }],
  },
] as const satisfies readonly DemoCategory[];

export const DEMO_BY_ID = new Map<DemoId, (typeof DEMO_METADATA)[number]>(
  DEMO_METADATA.map((demo) => [demo.id, demo])
);

export const DEMO_CATEGORY_BY_ID = new Map<
  DemoCategoryId,
  (typeof DEMO_CATEGORIES)[number]
>(DEMO_CATEGORIES.map((category) => [category.id, category]));

export function getDemoPath(demoId: string): string {
  return `/demos?demo=${demoId}`;
}

export function getDemoById(demoId: string | null | undefined): DemoCatalogEntry | null {
  return DEMO_BY_ID.get(demoId as DemoId) ?? null;
}

export function getDemoTitle(demo: Pick<DemoMetadata, "eyebrow" | "title">) {
  return `${demo.eyebrow} ${demo.title} Demo`;
}

export function getDemoDescription(
  demo: Pick<DemoMetadata, "eyebrow" | "title" | "tags" | "categoryId">
) {
  const tagSummary = demo.tags.length > 0 ? ` with ${demo.tags.join(", ")} patterns` : "";

  return `Explore the React Motion Gallery ${demo.eyebrow} ${demo.title} demo${tagSummary}.`;
}
