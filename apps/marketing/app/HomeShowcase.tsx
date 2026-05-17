"use client";

import Link from "next/link";
import { type ComponentType } from "react";
import type { SkeletonCacheSnapshot } from "react-motion-gallery/skeleton/cache";
import { SkeletonCacheProvider } from "react-motion-gallery/skeleton/cache/provider";
import { FullscreenCaptionThumbnailsDemo } from "./demos/fullscreen/fullscreen-caption-thumbnails/Component";
import { MasonrySpansDemo } from "./demos/masonry/masonry-spans/Component";
import { demoSkeletonCache } from "./demos/skeleton-cache";
import { SkeletonFlexCardsDemo } from "./demos/skeleton/skeleton-flex-cards/Component";
import { SliderParallaxDemo } from "./demos/slider/slider-parallax/Component";
import { ZoomPanGridDemo } from "./demos/zoom-pan/grid/Component";
import {
  ArrowUpRight,
  Columns3,
  Film,
  Grid3X3,
  Images,
  Maximize2,
  PanelsTopLeft,
  Rows3,
  ScanSearch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type ShowcaseDemo = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  tags: string[];
  Component: ComponentType;
};

type SurfaceLink = {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  tone: "cyan" | "blue" | "green" | "gold" | "magenta" | "lavender";
};

type HomeShowcaseProps = {
  skeletonCacheSnapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
};

const HOME_MASONRY_SPANS_CACHE = demoSkeletonCache("home-masonry-spans", {
  routeKey: "/",
});

function HomeMasonrySpansDemo() {
  return <MasonrySpansDemo cache={HOME_MASONRY_SPANS_CACHE} />;
}

const SHOWCASE_DEMOS = [
  {
    id: "slider-parallax",
    label: "Slider",
    eyebrow: "Featured pattern",
    title: "Motion that feels continuous",
    description:
      "Parallax, free-scroll drag, dots, arrows, fullscreen, and zoom/pan working together in one slider surface.",
    href: "/demos?demo=slider-parallax",
    tags: ["parallax", "loop", "fullscreen", "zoom"],
    Component: SliderParallaxDemo,
  },
  {
    id: "masonry-spans",
    label: "Masonry",
    eyebrow: "Layout depth",
    title: "Mixed media without awkward gaps",
    description:
      "Responsive spans, measured skeleton text, image/video cards, and balanced placement for editorial galleries.",
    href: "/demos?demo=masonry-spans",
    tags: ["spans", "video", "skeleton", "balanced"],
    Component: HomeMasonrySpansDemo,
  },
  {
    id: "fullscreen-caption-thumbnails",
    label: "Fullscreen",
    eyebrow: "Inspection mode",
    title: "Captions and thumbnail rails stay synced",
    description:
      "Open a gallery into fullscreen with overlay captions, bottom thumbnails, and zoom/pan slide inspection.",
    href: "/demos?demo=fullscreen-caption-thumbnails",
    tags: ["captions", "thumbnails", "overlay", "sync"],
    Component: FullscreenCaptionThumbnailsDemo,
  },
  {
    id: "skeleton-flex-cards",
    label: "Skeletons",
    eyebrow: "Loading fidelity",
    title: "Loading states shaped like the final UI",
    description:
      "Standalone skeleton primitives protect card rhythm while images decode and the final layout becomes ready.",
    href: "/demos?demo=skeleton-flex-cards",
    tags: ["standalone", "responsive", "text", "decode"],
    Component: SkeletonFlexCardsDemo,
  },
  {
    id: "zoom-pan-grid",
    label: "Zoom/Pan",
    eyebrow: "Image detail",
    title: "Click, drag, and inspect inside grids",
    description:
      "ZoomPanImage works as a standalone inspection surface and composes cleanly inside responsive grid items.",
    href: "/demos?demo=zoom-pan-grid",
    tags: ["grid", "pinch", "pan", "image"],
    Component: ZoomPanGridDemo,
  },
] satisfies ShowcaseDemo[];

const SURFACE_LINKS = [
  {
    title: "Slider",
    description: "Drag, wheel, grouping, effects, autoplay, thumbnails, and fullscreen handoffs.",
    href: "/demos?demo=slider-cards",
    Icon: Images,
    tone: "cyan",
  },
  {
    title: "Grid",
    description: "Auto-fill columns, explicit tracks, responsive spans, lazy media, and fullscreen triggers.",
    href: "/demos?demo=grid-columns",
    Icon: Grid3X3,
    tone: "green",
  },
  {
    title: "Masonry",
    description: "Balanced, round-robin, and horizontal-order placement for uneven card systems.",
    href: "/demos?demo=masonry-spans",
    Icon: Columns3,
    tone: "magenta",
  },
  {
    title: "Entries",
    description: "Record-driven rows with embedded slider, grid, or masonry media blocks.",
    href: "/demos?demo=entries-masonry",
    Icon: Rows3,
    tone: "blue",
  },
  {
    title: "Fullscreen",
    description: "Layout-agnostic fullscreen, overlays, captions, thumbnails, lazy loading, and close sync.",
    href: "/demos?demo=fullscreen-caption-thumbnails",
    Icon: Maximize2,
    tone: "lavender",
  },
  {
    title: "Video",
    description: "Optional Plyr-backed HTML5, YouTube, and Vimeo media inside gallery layouts.",
    href: "/demos?demo=slider-video-html5",
    Icon: Film,
    tone: "gold",
  },
  {
    title: "Skeletons",
    description: "Composable loading shells, measured text, force overlays, and layout-aware placeholders.",
    href: "/demos?demo=skeleton-flex-cards",
    Icon: Sparkles,
    tone: "cyan",
  },
  {
    title: "Zoom/Pan",
    description: "Standalone or embedded image inspection with click zoom, wheel, touch, and pan.",
    href: "/demos?demo=zoom-pan-grid",
    Icon: ScanSearch,
    tone: "green",
  },
] satisfies SurfaceLink[];

const PRODUCTION_POINTS = [
  {
    title: "Composable layouts",
    description: "Slider, Grid, and Masonry render direct children; Entries handles structured records.",
  },
  {
    title: "Fullscreen sync",
    description: "Shared indexes keep thumbnails, captions, lazy media, and close transitions aligned.",
  },
  {
    title: "Measured skeletons",
    description: "Browser-generated text metrics keep placeholders close to real responsive content.",
  },
  {
    title: "Optional video peers",
    description: "Plyr and plyr-react are only needed when you render the Video primitive.",
  },
  {
    title: "Subpath imports",
    description: "Import only the surface a route needs, from slider helpers to fullscreen plugins.",
  },
];

export function HomeShowcase(props: HomeShowcaseProps = {}) {
  return (
    <SkeletonCacheProvider snapshots={props.skeletonCacheSnapshots}>
      <div className="homeShowcase">
      <section className="homeShowcase__section" aria-labelledby="home-showcase-title">
        <div className="homeShowcase__sectionHeader">
          <span className="homeShowcase__eyebrow">Featured Patterns</span>
          <h2 className="homeShowcase__title" id="home-showcase-title">
            Try the surfaces that make React Motion Gallery useful.
          </h2>
          <p className="homeShowcase__lede">
            Each preview is a real demo component: drag the sliders, open fullscreen,
            inspect images, and jump into the full demo when a pattern fits.
          </p>
        </div>

        <div className="homeShowcaseList" role="list">
          {SHOWCASE_DEMOS.map((demo) => {
            const DemoComponent = demo.Component;
            return (
              <article
                className="homeShowcaseDemo"
                aria-labelledby={`home-showcase-${demo.id}-title`}
                key={demo.id}
                role="listitem"
              >
                <aside className="homeShowcaseDemo__copy">
                  <span className="homeShowcaseDemo__label">{demo.label}</span>
                  <span className="homeShowcaseDemo__eyebrow">{demo.eyebrow}</span>
                  <h3 id={`home-showcase-${demo.id}-title`}>{demo.title}</h3>
                  <p>{demo.description}</p>
                  <div
                    className="homeShowcaseDemo__tags"
                    aria-label={`${demo.label} features`}
                  >
                    {demo.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <Link className="homeShowcaseDemo__link" href={demo.href}>
                    Open full demo
                    <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden />
                  </Link>
                </aside>
                <div className="homeShowcaseDemo__frame">
                  <DemoComponent />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="homeShowcase__section" aria-labelledby="home-surfaces-title">
        <div className="homeShowcase__splitHeader">
          <div>
            <span className="homeShowcase__eyebrow">Explore by Surface</span>
            <h2 className="homeShowcase__title" id="home-surfaces-title">
              Pick the gallery shape you need next.
            </h2>
          </div>
          <Link className="homeShowcase__allLink" href="/demos">
            Browse all demos
            <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden />
          </Link>
        </div>

        <div className="homeSurfaceGrid" role="list">
          {SURFACE_LINKS.map((item) => {
            const Icon = item.Icon;

            return (
              <Link
                className="homeSurfaceCard"
                data-tone={item.tone}
                href={item.href}
                key={item.title}
                role="listitem"
              >
                <span className="homeSurfaceCard__icon" aria-hidden>
                  <Icon size={21} strokeWidth={2.1} />
                </span>
                <span className="homeSurfaceCard__content">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </span>
                <ArrowUpRight
                  className="homeSurfaceCard__arrow"
                  size={17}
                  strokeWidth={2.2}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="homeProduction" aria-labelledby="home-production-title">
        <div className="homeProduction__header">
          <PanelsTopLeft size={24} strokeWidth={2.1} aria-hidden />
          <div>
            <span className="homeShowcase__eyebrow">Production ready</span>
            <h2 className="homeProduction__title" id="home-production-title">
              Built for galleries that have to survive real layouts.
            </h2>
          </div>
        </div>
        <ul className="homeProduction__list">
          {PRODUCTION_POINTS.map((point) => (
            <li key={point.title}>
              <strong>{point.title}</strong>
              <span>{point.description}</span>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </SkeletonCacheProvider>
  );
}
