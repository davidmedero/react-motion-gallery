/* eslint-disable @next/next/no-img-element */
'use client';

import { ChevronDown } from "lucide-react";
import { startTransition, useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./demos.module.css";
import { GalleryCore, Slider, toMediaItems, useFullscreenController } from "react-motion-gallery";

type DemoComponent = () => ReactElement | null;

type DemoNavItem =
  | {
      type: "demo";
      demoId: string;
    }
  | {
      type: "group";
      id: string;
      label: string;
      demoIds: string[];
    };

type DemoCategory = {
  id: string;
  label: string;
  description: string;
  items: DemoNavItem[];
};

type DemoDefinition = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  focus: string;
  tags: string[];
  categoryId: string;
  Component: DemoComponent;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function SliderDefaultDemo() {
  const URLS = [
    "https://picsum.photos/id/1020/1600/900",
    "https://picsum.photos/id/1029/1600/900",
    "https://picsum.photos/id/1039/1600/900",
    "https://picsum.photos/id/1049/1600/900",
    "https://picsum.photos/id/1079/1600/900",
    "https://picsum.photos/id/1076/1600/900",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1020/3200/1800",
    "https://picsum.photos/id/1029/3200/1800",
    "https://picsum.photos/id/1039/3200/1800",
    "https://picsum.photos/id/1049/3200/1800",
    "https://picsum.photos/id/1079/3200/1800",
    "https://picsum.photos/id/1076/3200/1800",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100%",
          maxWidth: "550px",
          height: "100%",
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  function FullscreenAddon(props: {
  fullscreenEnabled?: boolean;
  }) {
    const { fullscreenEnabled = true } = props;

    const { fullscreenNode } = useFullscreenController({
      fullscreen: { 
        enabled: fullscreenEnabled,
      },
    });

    return <>{fullscreenNode}</>;
  }

  const MEDIA = toMediaItems(URLS);

  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        transitions={{
          loading: {
            // force: true,
            skeletonCount: 2,
            skeleton: {
              mode: "peek",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "550px",
                    height: "309px",
                    borderRadius: 12,
                  },
                },
              },
            }
          }
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide key={`img-${m.kind === 'image' ? m.src : ''}-${i}`} src={m.kind === 'image' ? m.src : ''} i={i} />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderLoopDemo() {
  return null;
}

function SliderVideoHtml5Demo() {
  return null;
}

function SliderVideoHtml5LoopDemo() {
  return null;
}

function SliderVideoYoutubeDemo() {
  return null;
}

function SliderVideoYoutubeLoopDemo() {
  return null;
}

function SliderVideoVimeoDemo() {
  return null;
}

function SliderVideoVimeoLoopDemo() {
  return null;
}

function SliderRightToLeftDemo() {
  return null;
}

function SliderGroupCellsDemo() {
  return null;
}

function SliderFreeScrollDemo() {
  return null;
}

function SliderSkipSnapsDemo() {
  return null;
}

function SliderCenterAlignDemo() {
  return null;
}

function SliderVariableWidthsDemo() {
  return null;
}

function SliderYAxisDemo() {
  return null;
}

function SliderCellsPerSlideDemo() {
  return null;
}

function SliderThumbnailsDemo() {
  return null;
}

function SliderLazyLoadDemo() {
  return null;
}

function SliderAutoScrollDemo() {
  return null;
}

function SliderAutoPlayDemo() {
  return null;
}

function SliderProgressDemo() {
  return null;
}

function SliderParallaxDemo() {
  return null;
}

function SliderScaleDemo() {
  return null;
}

function SliderFadeDemo() {
  return null;
}

function SliderCardsDemo() {
  return null;
}

function GridColumnsDemo() {
  return null;
}

function GridMinColumnWidthDemo() {
  return null;
}

function GridLazyLoadDemo() {
  return null;
}

function GridVideoHtml5Demo() {
  return null;
}

function GridVideoYoutubeDemo() {
  return null;
}

function GridVideoVimeoDemo() {
  return null;
}

function MasonryBalancedDemo() {
  return null;
}

function MasonryRoundRobinDemo() {
  return null;
}

function MasonryLazyLoadDemo() {
  return null;
}

function MasonryVideoHtml5Demo() {
  return null;
}

function MasonryVideoYoutubeDemo() {
  return null;
}

function MasonryVideoVimeoDemo() {
  return null;
}

function EntriesSliderDemo() {
  return null;
}

function EntriesGridDemo() {
  return null;
}

function EntriesMasonryDemo() {
  return null;
}

function FullscreenCaptionsDemo() {
  return null;
}

function FullscreenThumbnailsDemo() {
  return null;
}

function FullscreenOverlayDemo() {
  return null;
}

function FullscreenLazyLoadDemo() {
  return null;
}

const SLIDER_DEMOS: DemoDefinition[] = [
  {
    id: "slider-default",
    title: "Default",
    eyebrow: "Slider",
    summary: "Single-cell slider with the base motion model and direct click-to-fullscreen behavior.",
    focus: "Use this as the neutral starting point before layering in more opinionated navigation or effects.",
    tags: ["slider", "default", "fullscreen"],
    categoryId: "slider",
    Component: SliderDefaultDemo,
  },
  {
    id: "slider-loop",
    title: "Loop",
    eyebrow: "Slider",
    summary: "Continuous slider cycling with fullscreen still mapped back to canonical items.",
    focus: "Reach for this when the sequence should feel endless instead of bounded by a hard last slide.",
    tags: ["slider", "loop", "fullscreen"],
    categoryId: "slider",
    Component: SliderLoopDemo,
  },
  {
    id: "slider-video-html5",
    title: "HTML5",
    eyebrow: "Slider Video",
    summary: "Base slider using embedded HTML5 video slides with fullscreen playback still available.",
    focus: "Use this when you want local or CDN-hosted MP4 playback inside the slider track.",
    tags: ["slider", "video", "html5"],
    categoryId: "slider",
    Component: SliderVideoHtml5Demo,
  },
  {
    id: "slider-video-html5-loop",
    title: "HTML5 + Loop",
    eyebrow: "Slider Video",
    summary: "HTML5 video slides combined with looped slider navigation.",
    focus: "This is the version to validate clone behavior and fullscreen continuity around the loop seam.",
    tags: ["slider", "video", "loop"],
    categoryId: "slider",
    Component: SliderVideoHtml5LoopDemo,
  },
  {
    id: "slider-video-youtube",
    title: "Youtube",
    eyebrow: "Slider Video",
    summary: "Embedded YouTube slides mounted inside the base slider with fullscreen preserved via the active-slide control.",
    focus: "Use it to validate provider-specific embed behavior without dropping fullscreen support.",
    tags: ["slider", "video", "youtube"],
    categoryId: "slider",
    Component: SliderVideoYoutubeDemo,
  },
  {
    id: "slider-video-youtube-loop",
    title: "Youtube + Loop",
    eyebrow: "Slider Video",
    summary: "YouTube slide embedding with looped carousel behavior.",
    focus: "This variant is useful for checking provider embeds when the slider wraps and clones around the viewport.",
    tags: ["slider", "video", "youtube", "loop"],
    categoryId: "slider",
    Component: SliderVideoYoutubeLoopDemo,
  },
  {
    id: "slider-video-vimeo",
    title: "Vimeo",
    eyebrow: "Slider Video",
    summary: "Vimeo-backed video slides running inside the base slider and opening in fullscreen on demand.",
    focus: "Use this when your source media lives in Vimeo but the gallery still needs a unified fullscreen flow.",
    tags: ["slider", "video", "vimeo"],
    categoryId: "slider",
    Component: SliderVideoVimeoDemo,
  },
  {
    id: "slider-video-vimeo-loop",
    title: "Vimeo + Loop",
    eyebrow: "Slider Video",
    summary: "Looped Vimeo slides showing how embed providers behave when the track wraps.",
    focus: "This is the stress case for provider-backed video plus continuous slider navigation.",
    tags: ["slider", "video", "vimeo", "loop"],
    categoryId: "slider",
    Component: SliderVideoVimeoLoopDemo,
  },
  {
    id: "slider-right-to-left",
    title: "Right To Left",
    eyebrow: "Slider",
    summary: "RTL base direction mirrored in both the main slider and the fullscreen controller.",
    focus: "Use this to validate right-to-left interaction without rebuilding the gallery content model.",
    tags: ["slider", "rtl", "fullscreen"],
    categoryId: "slider",
    Component: SliderRightToLeftDemo,
  },
  {
    id: "slider-group-cells",
    title: "Group Cells",
    eyebrow: "Slider",
    summary: "Grouped cell snapping based on what fits into the viewport at each breakpoint.",
    focus: "Use this when the design wants multi-cell steps without hardcoding cells-per-slide values everywhere.",
    tags: ["slider", "group-cells", "responsive"],
    categoryId: "slider",
    Component: SliderGroupCellsDemo,
  },
  {
    id: "slider-free-scroll",
    title: "Free Scroll",
    eyebrow: "Slider",
    summary: "Momentum-based slider movement without strict snapping between slides.",
    focus: "Reach for this when the gallery should feel closer to a trackpad-driven surface than a paged carousel.",
    tags: ["slider", "free-scroll", "motion"],
    categoryId: "slider",
    Component: SliderFreeScrollDemo,
  },
  {
    id: "slider-skip-snaps",
    title: "Skip Snaps",
    eyebrow: "Slider",
    summary: "Free-scrolling slider with skip-snaps enabled to loosen the lock to nearest targets.",
    focus: "Use it when the track should glide past intermediate snap points instead of catching each one.",
    tags: ["slider", "skip-snaps", "free-scroll"],
    categoryId: "slider",
    Component: SliderSkipSnapsDemo,
  },
  {
    id: "slider-center-align",
    title: "Center Align",
    eyebrow: "Slider",
    summary: "Centered alignment for the active slide while fullscreen remains tied to the same base order.",
    focus: "This is useful when the composition should hold the active slide in the center instead of tracking from the left edge.",
    tags: ["slider", "center-align", "layout"],
    categoryId: "slider",
    Component: SliderCenterAlignDemo,
  },
  {
    id: "slider-variable-widths",
    title: "Variable Widths",
    eyebrow: "Slider",
    summary: "Mixed slide widths inside the same track with fullscreen preserving the canonical item order.",
    focus: "Use this for more editorial carousels where the cells should not all resolve to the same fixed width.",
    tags: ["slider", "variable-widths", "editorial"],
    categoryId: "slider",
    Component: SliderVariableWidthsDemo,
  },
  {
    id: "slider-y-axis",
    title: "Y Axis",
    eyebrow: "Slider",
    summary: "Vertical slider flow with fullscreen kept in the same demo shell.",
    focus: "This is the version to inspect when the gallery needs vertical travel instead of horizontal swiping.",
    tags: ["slider", "y-axis", "vertical"],
    categoryId: "slider",
    Component: SliderYAxisDemo,
  },
  {
    id: "slider-cells-per-slide",
    title: "Cells Per Slide",
    eyebrow: "Slider",
    summary: "Explicit cells-per-slide rules applied responsively across the viewport range.",
    focus: "Use this when the design system wants specific slide counts at specific breakpoints instead of auto grouping.",
    tags: ["slider", "cells-per-slide", "responsive"],
    categoryId: "slider",
    Component: SliderCellsPerSlideDemo,
  },
  {
    id: "slider-thumbnails",
    title: "Thumbnails",
    eyebrow: "Slider",
    summary: "Base slider synced to a thumbnail rail through a shared index channel.",
    focus: "This is the pattern to use when users need direct visual navigation instead of relying on arrows or dots.",
    tags: ["slider", "thumbnails", "sync"],
    categoryId: "slider",
    Component: SliderThumbnailsDemo,
  },
  {
    id: "slider-lazy-load",
    title: "Lazy Load",
    eyebrow: "Slider",
    summary: "Slider media revealed on demand while fullscreen remains available for each item.",
    focus: "Use this to reduce the initial cost of media-heavy sliders without dropping the fullscreen affordance.",
    tags: ["slider", "lazy-load", "media"],
    categoryId: "slider",
    Component: SliderLazyLoadDemo,
  },
  {
    id: "slider-auto-scroll",
    title: "Auto Scroll",
    eyebrow: "Slider",
    summary: "Continuous motion driven by auto-scroll rather than user input.",
    focus: "Use it when the gallery should feel ambient and constantly in motion until the user takes over.",
    tags: ["slider", "auto-scroll", "motion"],
    categoryId: "slider",
    Component: SliderAutoScrollDemo,
  },
  {
    id: "slider-auto-play",
    title: "Auto Play",
    eyebrow: "Slider",
    summary: "Timed slide progression with fullscreen still bound to the active media set.",
    focus: "This is the right fit when the gallery should advance as a sequence instead of gliding continuously.",
    tags: ["slider", "auto-play", "sequence"],
    categoryId: "slider",
    Component: SliderAutoPlayDemo,
  },
  {
    id: "slider-progress",
    title: "Progress",
    eyebrow: "Slider",
    summary: "Progress bar control mounted into the base slider while fullscreen keeps the same item order.",
    focus: "Use this when the gallery benefits from explicit wayfinding but dots would add too much UI noise.",
    tags: ["slider", "progress", "controls"],
    categoryId: "slider",
    Component: SliderProgressDemo,
  },
  {
    id: "slider-parallax",
    title: "Parallax",
    eyebrow: "Slider",
    summary: "Built-in parallax motion layered over the base slider and preserved alongside fullscreen.",
    focus: "Use this when the carousel needs a stronger sense of depth without building a custom effect stack.",
    tags: ["slider", "parallax", "effects"],
    categoryId: "slider",
    Component: SliderParallaxDemo,
  },
  {
    id: "slider-scale",
    title: "Scale",
    eyebrow: "Slider",
    summary: "Inactive slides scale away slightly while fullscreen still resolves from the active cell.",
    focus: "This variant adds a subtle focus cue without changing the underlying layout rules.",
    tags: ["slider", "scale", "effects"],
    categoryId: "slider",
    Component: SliderScaleDemo,
  },
  {
    id: "slider-fade",
    title: "Fade",
    eyebrow: "Slider",
    summary: "Cross-fade slide transitions instead of translated movement in the base slider.",
    focus: "Use this when the gallery should feel closer to a slideshow than a spatial carousel.",
    tags: ["slider", "fade", "effects"],
    categoryId: "slider",
    Component: SliderFadeDemo,
  },
  {
    id: "slider-cards",
    title: "Cards",
    eyebrow: "Slider",
    summary: "Card-based slider cells mixing image, metadata, and copy while fullscreen still targets the underlying media.",
    focus: "Use this when the base surface should feel like a content module instead of a pure image strip.",
    tags: ["slider", "cards", "editorial"],
    categoryId: "slider",
    Component: SliderCardsDemo,
  },
];

const GRID_DEMOS: DemoDefinition[] = [
  {
    id: "grid-columns",
    title: "Columns",
    eyebrow: "Grid",
    summary: "Explicit responsive column counts with fullscreen enabled on each media card.",
    focus: "Use this when the layout needs deterministic row structure across specific breakpoints.",
    tags: ["grid", "columns", "fullscreen"],
    categoryId: "grid",
    Component: GridColumnsDemo,
  },
  {
    id: "grid-min-column-width",
    title: "Min Column Width",
    eyebrow: "Grid",
    summary: "Auto-fit grid columns driven by a minimum item width instead of explicit counts.",
    focus: "Reach for this when the wall should adapt fluidly and you care more about minimum card size than exact columns.",
    tags: ["grid", "min-column-width", "responsive"],
    categoryId: "grid",
    Component: GridMinColumnWidthDemo,
  },
  {
    id: "grid-lazy-load",
    title: "Lazy Load",
    eyebrow: "Grid",
    summary: "Grid cards revealed on demand while fullscreen remains available for every image.",
    focus: "Use this for heavier walls where the initial viewport should stay fast but inspection still matters.",
    tags: ["grid", "lazy-load", "media"],
    categoryId: "grid",
    Component: GridLazyLoadDemo,
  },
  {
    id: "grid-video-html5",
    title: "HTML5",
    eyebrow: "Grid Video",
    summary: "HTML5 video cards arranged in a grid with per-card fullscreen access.",
    focus: "Use this for hosted MP4 libraries that still need a fullscreen escape hatch from the wall view.",
    tags: ["grid", "video", "html5"],
    categoryId: "grid",
    Component: GridVideoHtml5Demo,
  },
  {
    id: "grid-video-youtube",
    title: "Youtube",
    eyebrow: "Grid Video",
    summary: "YouTube-backed video cards inside the grid surface with fullscreen support preserved.",
    focus: "This is useful when editorial walls mix provider embeds with the same gallery-level fullscreen runtime.",
    tags: ["grid", "video", "youtube"],
    categoryId: "grid",
    Component: GridVideoYoutubeDemo,
  },
  {
    id: "grid-video-vimeo",
    title: "Vimeo",
    eyebrow: "Grid Video",
    summary: "Vimeo embeds presented as grid cards while still opening inside the gallery fullscreen layer.",
    focus: "Use it when the wall view needs provider playback but fullscreen should remain consistent with the rest of the library.",
    tags: ["grid", "video", "vimeo"],
    categoryId: "grid",
    Component: GridVideoVimeoDemo,
  },
];

const MASONRY_DEMOS: DemoDefinition[] = [
  {
    id: "masonry-balanced",
    title: "Balanced",
    eyebrow: "Masonry",
    summary: "Balanced masonry placement keeping the columns visually even while fullscreen stays item-aware.",
    focus: "Use this when visual rhythm matters more than preserving the source order column by column.",
    tags: ["masonry", "balanced", "fullscreen"],
    categoryId: "masonry",
    Component: MasonryBalancedDemo,
  },
  {
    id: "masonry-round-robin",
    title: "Round Robin",
    eyebrow: "Masonry",
    summary: "Round-robin placement preserving a simpler left-to-right source distribution.",
    focus: "Choose this when column assignment should stay predictable even if the layout becomes less visually balanced.",
    tags: ["masonry", "round-robin", "distribution"],
    categoryId: "masonry",
    Component: MasonryRoundRobinDemo,
  },
  {
    id: "masonry-lazy-load",
    title: "Lazy Load",
    eyebrow: "Masonry",
    summary: "Masonry wall with lazy media reveal and fullscreen still wired to the flattened item order.",
    focus: "Use this when the wall is image-heavy and you want to delay work without dropping the waterfall presentation.",
    tags: ["masonry", "lazy-load", "media"],
    categoryId: "masonry",
    Component: MasonryLazyLoadDemo,
  },
  {
    id: "masonry-video-html5",
    title: "HTML5",
    eyebrow: "Masonry Video",
    summary: "HTML5 video cards dropped into a masonry wall with manual fullscreen entry points.",
    focus: "Use this when hosted video needs a more editorial waterfall treatment instead of uniform rows.",
    tags: ["masonry", "video", "html5"],
    categoryId: "masonry",
    Component: MasonryVideoHtml5Demo,
  },
  {
    id: "masonry-video-youtube",
    title: "Youtube",
    eyebrow: "Masonry Video",
    summary: "YouTube-backed masonry cards with fullscreen still controlled by the gallery runtime.",
    focus: "This is the provider-embed version of the masonry surface when fullscreen still needs to feel native.",
    tags: ["masonry", "video", "youtube"],
    categoryId: "masonry",
    Component: MasonryVideoYoutubeDemo,
  },
  {
    id: "masonry-video-vimeo",
    title: "Vimeo",
    eyebrow: "Masonry Video",
    summary: "Vimeo cards flowing through the masonry wall with fullscreen support preserved.",
    focus: "Use it when the visual layout should stay irregular but the fullscreen experience should stay consistent.",
    tags: ["masonry", "video", "vimeo"],
    categoryId: "masonry",
    Component: MasonryVideoVimeoDemo,
  },
];

const ENTRIES_DEMOS: DemoDefinition[] = [
  {
    id: "entries-slider",
    title: "Slider",
    eyebrow: "Entries",
    summary: "Structured entries whose per-entry media surface is a slider, with owner-aware fullscreen overlays intact.",
    focus: "Use this when each entry needs a short sequence instead of a single thumbnail or a fixed grid.",
    tags: ["entries", "slider", "fullscreen"],
    categoryId: "entries",
    Component: EntriesSliderDemo,
  },
  {
    id: "entries-grid",
    title: "Grid",
    eyebrow: "Entries",
    summary: "Entries rendered with grid-like media blocks while fullscreen still resolves back to the correct owner record.",
    focus: "Use this for editorial feeds or case studies where each entry needs a compact image wall.",
    tags: ["entries", "grid", "fullscreen"],
    categoryId: "entries",
    Component: EntriesGridDemo,
  },
  {
    id: "entries-masonry",
    title: "Masonry",
    eyebrow: "Entries",
    summary: "Entries with masonry-style media blocks and the same flattened fullscreen index under the hood.",
    focus: "Reach for this when entry media should feel looser and more editorial without losing owner context in fullscreen.",
    tags: ["entries", "masonry", "fullscreen"],
    categoryId: "entries",
    Component: EntriesMasonryDemo,
  },
];

const FULLSCREEN_DEMOS: DemoDefinition[] = [
  {
    id: "fullscreen-captions",
    title: "Captions",
    eyebrow: "Fullscreen",
    summary: "Fullscreen captions rendered in a dedicated side column while the base slider stays minimal.",
    focus: "Use this when the overlay needs room for longer editorial context or metadata next to the media.",
    tags: ["fullscreen", "captions", "overlay"],
    categoryId: "fullscreen",
    Component: FullscreenCaptionsDemo,
  },
  {
    id: "fullscreen-thumbnails",
    title: "Thumbnails",
    eyebrow: "Fullscreen",
    summary: "Fullscreen overlay with a dedicated thumbnail rail mounted into the modal.",
    focus: "Reach for this when users need to jump directly between media after opening the fullscreen experience.",
    tags: ["fullscreen", "thumbnails", "navigation"],
    categoryId: "fullscreen",
    Component: FullscreenThumbnailsDemo,
  },
  {
    id: "fullscreen-overlay",
    title: "Overlay",
    eyebrow: "Fullscreen",
    summary: "Caption content restyled as a denser overlay block instead of a long side column.",
    focus: "Use this when fullscreen metadata should stay compact and visually attached to the media.",
    tags: ["fullscreen", "overlay", "captions"],
    categoryId: "fullscreen",
    Component: FullscreenOverlayDemo,
  },
  {
    id: "fullscreen-lazy-load",
    title: "LazyLoad",
    eyebrow: "Fullscreen",
    summary: "Fullscreen image loading enabled explicitly so the overlay can decode and reveal media on demand.",
    focus: "Use this to validate the fullscreen lazy-load path separately from the base surface behavior.",
    tags: ["fullscreen", "lazy-load", "media"],
    categoryId: "fullscreen",
    Component: FullscreenLazyLoadDemo,
  },
];

const DEMOS: DemoDefinition[] = [
  ...SLIDER_DEMOS,
  ...GRID_DEMOS,
  ...MASONRY_DEMOS,
  ...ENTRIES_DEMOS,
  ...FULLSCREEN_DEMOS,
];

const DEMO_BY_ID = new Map(DEMOS.map((demo) => [demo.id, demo]));

const DEMO_CATEGORIES: DemoCategory[] = [
  {
    id: "slider",
    label: "Slider",
    description: "Base carousel variants covering motion, direction, grouping, media, and navigation layers.",
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
      { type: "demo", demoId: "slider-center-align" },
      { type: "demo", demoId: "slider-variable-widths" },
      { type: "demo", demoId: "slider-y-axis" },
      { type: "demo", demoId: "slider-cells-per-slide" },
      { type: "demo", demoId: "slider-thumbnails" },
      { type: "demo", demoId: "slider-lazy-load" },
      { type: "demo", demoId: "slider-auto-scroll" },
      { type: "demo", demoId: "slider-auto-play" },
      { type: "demo", demoId: "slider-progress" },
      { type: "demo", demoId: "slider-parallax" },
      { type: "demo", demoId: "slider-scale" },
      { type: "demo", demoId: "slider-fade" },
      { type: "demo", demoId: "slider-cards" },
    ],
  },
  {
    id: "grid",
    label: "Grid",
    description: "Row-based gallery surfaces for explicit columns, auto-fit sizing, lazy media, and video cards.",
    items: [
      { type: "demo", demoId: "grid-columns" },
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
    description: "Waterfall layouts for uneven heights, alternative placement rules, and mixed video walls.",
    items: [
      { type: "demo", demoId: "masonry-balanced" },
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
    description: "Structured editorial rows whose internal media blocks can be sliders, grids, or masonry collections.",
    items: [
      { type: "demo", demoId: "entries-slider" },
      { type: "demo", demoId: "entries-grid" },
      { type: "demo", demoId: "entries-masonry" },
    ],
  },
  {
    id: "fullscreen",
    label: "Fullscreen",
    description: "Overlay-specific demos for captions, thumbnail rails, compact overlays, and lazy media loading.",
    items: [
      { type: "demo", demoId: "fullscreen-captions" },
      { type: "demo", demoId: "fullscreen-thumbnails" },
      { type: "demo", demoId: "fullscreen-overlay" },
      { type: "demo", demoId: "fullscreen-lazy-load" },
    ],
  },
];

const DEFAULT_DEMO_ID = DEMOS[0]?.id ?? "";

export default function DemosPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const fallbackDemo = DEMOS[0];
  const fallbackCategory = DEMO_CATEGORIES[0];

  if (!fallbackDemo || !fallbackCategory) {
    return null;
  }

  const requestedDemoId = searchParams.get("demo");
  const selectedDemo = DEMO_BY_ID.get(requestedDemoId ?? "") ?? fallbackDemo;
  const selectedCategory =
    DEMO_CATEGORIES.find((category) => category.id === selectedDemo.categoryId) ??
    fallbackCategory;

  const SelectedDemoComponent = selectedDemo.Component;

  function toggleCategory(categoryId: string) {
    if (categoryId === selectedCategory.id) {
      return;
    }

    setExpandedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  function selectDemo(demo: DemoDefinition) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (demo.id === DEFAULT_DEMO_ID) {
      nextParams.delete("demo");
    } else {
      nextParams.set("demo", demo.id);
    }

    const query = nextParams.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <span className={styles.heroEyebrow}>Interactive Demo Library</span>
          <h1 className={styles.heroTitle}>Browse one gallery mode at a time.</h1>
          <p className={styles.heroCopy}>
            The left rail still groups every planned variant by surface. Each demo
            now points to an empty component so you can build the examples yourself
            without undoing generated demo code first.
          </p>
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarIntro}>
                <span className={styles.sidebarKicker}>Browse</span>
                <strong className={styles.sidebarTitle}>{DEMOS.length} demos</strong>
                <p className={styles.sidebarCopy}>
                  All demo slots stay wired into the page and grouped by layout,
                  media type, and fullscreen pattern.
                </p>
              </div>

              {DEMO_CATEGORIES.map((category) => {
                const isOpen =
                  category.id === selectedCategory.id ||
                  expandedCategories.includes(category.id);

                return (
                  <section key={category.id} className={styles.category}>
                    <button
                      type="button"
                      className={styles.categoryToggle}
                      onClick={() => toggleCategory(category.id)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.categoryToggleCopy}>
                        <strong className={styles.categoryLabel}>{category.label}</strong>
                        <span className={styles.categoryDescription}>
                          {category.description}
                        </span>
                      </span>
                      <ChevronDown
                        className={cx(
                          styles.categoryChevron,
                          isOpen && styles.categoryChevronOpen
                        )}
                        strokeWidth={1.7}
                      />
                    </button>

                    {isOpen ? (
                      <div className={styles.demoList}>
                        {category.items.map((item) => {
                          if (item.type === "demo") {
                            const demo = DEMO_BY_ID.get(item.demoId);

                            if (!demo) {
                              return null;
                            }

                            const isActive = demo.id === selectedDemo.id;

                            return (
                              <button
                                key={demo.id}
                                type="button"
                                className={cx(
                                  styles.demoLink,
                                  isActive && styles.demoLinkActive
                                )}
                                onClick={() => selectDemo(demo)}
                                aria-current={isActive ? "page" : undefined}
                              >
                                <span className={styles.demoLinkEyebrow}>
                                  {demo.eyebrow}
                                </span>
                                <strong className={styles.demoLinkTitle}>
                                  {demo.title}
                                </strong>
                              </button>
                            );
                          }

                          return (
                            <div key={item.id} className={styles.demoGroup}>
                              <span className={styles.demoGroupLabel}>{item.label}</span>
                              <div className={styles.demoGroupList}>
                                {item.demoIds.map((demoId) => {
                                  const demo = DEMO_BY_ID.get(demoId);

                                  if (!demo) {
                                    return null;
                                  }

                                  const isActive = demo.id === selectedDemo.id;

                                  return (
                                    <button
                                      key={demo.id}
                                      type="button"
                                      className={cx(
                                        styles.demoLink,
                                        isActive && styles.demoLinkActive
                                      )}
                                      onClick={() => selectDemo(demo)}
                                      aria-current={isActive ? "page" : undefined}
                                    >
                                      <span className={styles.demoLinkEyebrow}>
                                        {demo.eyebrow}
                                      </span>
                                      <strong className={styles.demoLinkTitle}>
                                        {demo.title}
                                      </strong>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </aside>

          <main className={styles.main}>
            <section className={styles.demoCard}>
              <div className={styles.demoHeader}>
                <span className={styles.demoCategory}>{selectedCategory.label}</span>
                <h2 className={styles.demoTitle}>{selectedDemo.title}</h2>
                <p className={styles.demoSummary}>{selectedDemo.summary}</p>
                <div className={styles.tagRow}>
                  {selectedDemo.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.demoCanvas}>
                <SelectedDemoComponent />
              </div>

              <div className={styles.demoFooter}>
                <span className={styles.demoFooterLabel}>Planned focus</span>
                <p className={styles.demoFooterCopy}>{selectedDemo.focus}</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
