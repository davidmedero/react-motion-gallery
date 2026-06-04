"use client";

import Link from "next/link";
import { type ComponentType } from "react";
import type { SkeletonCacheSnapshot } from "react-motion-gallery/skeleton/cache";
import { SkeletonCacheProvider } from "react-motion-gallery/skeleton/cache/provider";
import { FullscreenCaptionThumbnailsDemo } from "./demos/fullscreen/fullscreen-caption-thumbnails/Component";
import { MasonrySpansDemo } from "./demos/masonry/masonry-spans/Component";
import { SkeletonFlexCardsDemo } from "./demos/skeleton/skeleton-flex-cards/Component";
import { SliderParallaxDemo } from "./demos/slider/slider-parallax/Component";
import { ZoomPanGridDemo } from "./demos/zoom-pan/grid/Component";
import {
  ArrowUpRight,
  PanelsTopLeft,
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

type HomeShowcaseProps = {
  skeletonCacheSnapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
};

function HomeMasonrySpansDemo() {
  return <MasonrySpansDemo />;
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
      "Standalone skeleton primitives protect card rhythm while images decode.",
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
