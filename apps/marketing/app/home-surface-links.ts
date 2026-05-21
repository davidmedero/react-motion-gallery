import {
  Columns3,
  Film,
  Grid3X3,
  Images,
  Maximize2,
  Rows3,
  ScanSearch,
  Sparkles,
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
    description: "A fluid carousel with an extensive API, plugins, SSR support, fullscreen sync and video handling.",
    href: "/demos?demo=slider-cards",
    Icon: Images,
    tone: "cyan",
  },
  {
    title: "Grid",
    description: "Auto-fill columns, explicit tracks, responsive spans, lazy load, SSR support and fullscreen handoffs.",
    href: "/demos?demo=grid-columns",
    Icon: Grid3X3,
    tone: "green",
  },
  {
    title: "Masonry",
    description: "Balanced, round-robin, and horizontal-order placement options with responsive spans, lazy load, SSR support and fullscreen.",
    href: "/demos?demo=masonry-spans",
    Icon: Columns3,
    tone: "magenta",
  },
  {
    title: "Entries",
    description: "Record-driven rows with embedded slider, grid, or masonry media blocks and SSR support. Perfect for customer reviews.",
    href: "/demos?demo=entries-masonry",
    Icon: Rows3,
    tone: "blue",
  },
  {
    title: "Fullscreen",
    description: "Layout-agnostic fullscreen carousel with overlays, captions, thumbnails, lazy loading, transform/opacity effects and close sync.",
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
    Icon: Sparkles,
    tone: "cyan",
  },
  {
    title: "Zoom/Pan",
    description: "Standalone or embedded image inspection with click, wheel, touch, pan, pinch and trackpad gestures.",
    href: "/demos?demo=zoom-pan-grid",
    Icon: ScanSearch,
    tone: "green",
  },
] satisfies HomeSurfaceLink[];
