import {
  LayoutDashboard,
  Film,
  Grid3X3,
  GalleryHorizontalEnd,
  Maximize2,
  Rows3,
  ScanSearch,
  Skull,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export type HomeSurfaceLink = {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  tone: "cyan" | "blue" | "green" | "gold" | "magenta" | "lavender";
};

export const HOME_SURFACE_LINKS = [
  {
    title: "Slider",
    description: "A fluid carousel with an extensive API, plugins, effects, lazy load, SSR support, fullscreen sync, breakpoint options and video handling.",
    href: "/demos?demo=slider-cards",
    Icon: GalleryHorizontalEnd,
    tone: "cyan",
  },
  {
    title: "Grid",
    description: "Auto-fill columns, explicit tracks, responsive spans, lazy load, SSR support, breakpoint options and fullscreen sync.",
    href: "/demos?demo=grid-columns",
    Icon: Grid3X3,
    tone: "green",
  },
  {
    title: "Masonry",
    description: "Lightweight image-first masonry with dimensioned items, plus measured subpaths for spans, lazy load, video, and fullscreen sync.",
    href: "/demos?demo=masonry-core-balanced",
    Icon: LayoutDashboard,
    tone: "magenta",
  },
  {
    title: "Entries",
    description: "Record-driven rows with embedded slider, grid, or masonry media blocks, SSR support and fullscreen entry-based overlays. Perfect for customer reviews.",
    href: "/demos?demo=entries-masonry",
    Icon: Rows3,
    tone: "blue",
  },
  {
    title: "Fullscreen",
    description: "Modular fullscreen carousel with overlays, captions, thumbnails, lazy loading, transform/opacity effects and close-state sync that can be used standalone.",
    href: "/demos?demo=fullscreen-caption-thumbnails",
    Icon: Maximize2,
    tone: "lavender",
  },
  {
    title: "Video",
    description: "Optional Plyr-backed HTML5, YouTube, and Vimeo wrapper with gallery-aware handling, fullscreen controls, lazy load, and reveal transitions.",
    href: "/demos?demo=slider-video-html5",
    Icon: Film,
    tone: "gold",
  },
  {
    title: "Skeletons",
    description: "Auto-generated SSR-stable placeholders that mirror full responsive layouts, including wrapped text, with cached layout snapshots to promote stability on first paint.",
    href: "/demos?demo=skeleton-flex-cards",
    Icon: Skull,
    tone: "cyan",
  },
  {
    title: "Reveal",
    description: "Standalone <Reveal> and useReveal APIs for IntersectionObserver-driven fade/transform transitions, plus reveal props for Slider, Grid, Masonry, and Entries.",
    href: "/demos?demo=reveal-sections",
    Icon: WandSparkles,
    tone: "blue",
  },
  {
    title: "Zoom/Pan",
    description: "Standalone or embedded image inspection with click, wheel, touch, pan, pinch and trackpad gestures.",
    href: "/demos?demo=zoom-pan-grid",
    Icon: ScanSearch,
    tone: "green",
  },
] satisfies HomeSurfaceLink[];
